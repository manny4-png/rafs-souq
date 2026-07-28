from __future__ import annotations

import hashlib
import hmac
import json
import logging
import re
import secrets
from decimal import Decimal

from django.conf import settings
from django.core import signing
from django.db import transaction
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Category, Customer, Order, OrderItem, Product, ProductVariant, StoreSetting
from .payments import (
    InventoryUnavailableError,
    PaymentValidationError,
    amount_in_subunits,
    mark_order_paid,
)
from .paystack import PaystackError, initialize_transaction, verify_transaction
from .validation import PayloadValidationError, clean_order_payload


DELIVERY_FEES = {
    "ashanti-region": Decimal("0.00"),
    "tema-ashaiman-kasoa": Decimal("0.00"),
    "other-regions": Decimal("0.00"),
    "within-accra": Decimal("0.00"),
}

DELIVERY_METHOD_NAMES = {
    "ashanti-region": "Ashanti Region — GH₵50 paid to rider",
    "tema-ashaiman-kasoa": "Kasoa / Tema / Ashaiman — GH₵40 paid to rider",
    "other-regions": "Other regions — GH₵50 paid to rider",
    "within-accra": "Within Accra — GH₵35 paid to rider",
}
SLUG_PATTERN = re.compile(r"^[a-z0-9-]{1,140}$")
CHECKOUT_TOKEN_SALT = "store.checkout"
CHECKOUT_TOKEN_MAX_AGE = 30 * 60
logger = logging.getLogger(__name__)


def absolute_media_url(request: HttpRequest, file_field) -> str | None:
    if not file_field:
        return None
    return request.build_absolute_uri(file_field.url)


def product_image_urls(request: HttpRequest, product: Product) -> list[str]:
    urls = []
    main = absolute_media_url(request, product.main_image)
    if main:
        urls.append(main)
    for image in product.images.all():
        url = absolute_media_url(request, image.image)
        if url:
            urls.append(url)
    return urls


def serialize_category(request: HttpRequest, category: Category) -> dict:
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image": absolute_media_url(request, category.image),
    }


def serialize_variant(variant: ProductVariant) -> dict:
    colour_swatch = colour_name_to_swatch(variant.color_name)
    return {
        "id": variant.id,
        "sku": variant.sku,
        "colorName": variant.color_name,
        "colorHex": colour_swatch,
        "size": variant.size,
        "priceAdjustment": str(variant.price_adjustment),
        "stockQuantity": variant.stock_quantity,
        "inStock": variant.stock_quantity > 0,
    }


def colour_name_to_swatch(name: str) -> str:
    """Turn the store owner's plain-language colour into a storefront swatch."""
    normalised = " ".join((name or "").strip().lower().replace("-", " ").split())
    swatches = {
        "black": "#111111", "white": "#F7F4EE", "ivory": "#FFFFF0",
        "cream": "#FFFDD0", "beige": "#D8C3A5", "brown": "#795548",
        "tan": "#D2B48C", "camel": "#C19A6B", "grey": "#808080", "gray": "#808080",
        "silver": "#C0C0C0", "gold": "#C9A227", "rose gold": "#B76E79",
        "red": "#C0392B", "wine": "#722F37", "burgundy": "#800020", "maroon": "#800000",
        "pink": "#E8A0B5", "blush": "#DE9FA7", "peach": "#FFCBA4", "coral": "#FF7F50",
        "orange": "#E67E22", "yellow": "#F1C40F", "mustard": "#D4A017",
        "green": "#2E7D32", "olive": "#808000", "lime": "#A4C639", "emerald": "#008C6A",
        "blue": "#2563A8", "navy": "#16213E", "royal blue": "#4169E1", "sky blue": "#87CEEB",
        "teal": "#008080", "turquoise": "#40E0D0", "purple": "#6A4C93", "lilac": "#C8A2C8",
        "lavender": "#B57EDC", "plum": "#8E4585", "multicolour": "#C95D63", "multicolor": "#C95D63",
    }
    return swatches.get(normalised, "#8B5D48")


def serialize_product(request: HttpRequest, product: Product) -> dict:
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "sku": product.sku,
        "category": product.category.slug,
        "categoryName": product.category.name,
        "description": product.description,
        "details": product.details,
        "tags": product.tags,
        "price": str(product.price),
        "compareAtPrice": str(product.compare_at_price) if product.compare_at_price else None,
        "currency": product.currency,
        "badge": product.badge or None,
        "isFeatured": product.is_featured,
        "stockQuantity": product.stock_quantity,
        "inStock": product.is_in_stock,
        "images": product_image_urls(request, product),
        "variants": [serialize_variant(variant) for variant in product.variants.filter(is_active=True)],
        "updatedAt": product.updated_at.isoformat(),
    }


@require_GET
def health(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "ok"})


@require_GET
def csrf(request: HttpRequest) -> JsonResponse:
    token = signing.dumps({"purpose": "checkout"}, salt=CHECKOUT_TOKEN_SALT)
    return JsonResponse({"csrfToken": token})


@require_GET
def categories(request: HttpRequest) -> JsonResponse:
    queryset = Category.objects.filter(is_active=True)
    return JsonResponse({"categories": [serialize_category(request, category) for category in queryset]})


@require_GET
def products(request: HttpRequest) -> JsonResponse:
    queryset = (
        Product.objects.select_related("category")
        .prefetch_related("images", "variants")
        .filter(status=Product.Status.ACTIVE, category__is_active=True)
    )

    category = request.GET.get("category")
    if category:
        if not SLUG_PATTERN.fullmatch(category):
            return JsonResponse({"error": "Invalid category"}, status=400)
        queryset = queryset.filter(category__slug=category)

    featured = request.GET.get("featured")
    if featured and featured not in {"0", "1", "true", "false", "True", "False"}:
        return JsonResponse({"error": "Invalid featured filter"}, status=400)
    if featured in {"1", "true", "True"}:
        queryset = queryset.filter(is_featured=True)

    search = request.GET.get("search", "").strip()
    if search:
        if len(search) > 100 or any(ord(character) < 32 for character in search):
            return JsonResponse({"error": "Invalid search query"}, status=400)
        queryset = queryset.filter(name__icontains=search) | queryset.filter(description__icontains=search)

    return JsonResponse({"products": [serialize_product(request, product) for product in queryset.distinct()]})


@require_GET
def product_detail(request: HttpRequest, slug: str) -> JsonResponse:
    try:
        product = (
            Product.objects.select_related("category")
            .prefetch_related("images", "variants")
            .get(slug=slug, status=Product.Status.ACTIVE, category__is_active=True)
        )
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)

    return JsonResponse({"product": serialize_product(request, product)})


def get_store_settings() -> StoreSetting:
    settings = StoreSetting.objects.first()
    if settings:
        return settings
    return StoreSetting()


@require_POST
@csrf_exempt
def create_order(request: HttpRequest) -> JsonResponse:
    try:
        token_data = signing.loads(
            request.headers.get("X-CSRFToken", ""),
            salt=CHECKOUT_TOKEN_SALT,
            max_age=CHECKOUT_TOKEN_MAX_AGE,
        )
        if token_data != {"purpose": "checkout"}:
            raise signing.BadSignature
    except (signing.BadSignature, signing.SignatureExpired):
        return JsonResponse(
            {"error": "Checkout session expired. Please try again."},
            status=403,
        )

    try:
        raw_payload = json.loads(
            request.body.decode("utf-8"),
            parse_constant=lambda value: (_ for _ in ()).throw(ValueError(f"Invalid number: {value}")),
        )
        payload = clean_order_payload(raw_payload)
    except (json.JSONDecodeError, UnicodeDecodeError, PayloadValidationError, ValueError) as exc:
        message = str(exc) if isinstance(exc, PayloadValidationError) else "Invalid JSON payload"
        return JsonResponse({"error": message}, status=400)

    fulfillment = payload["fulfillment"]
    delivery_area = payload["deliveryArea"]
    if fulfillment == "delivery" and delivery_area not in DELIVERY_FEES:
        return JsonResponse({"error": "Please select a valid delivery area"}, status=400)

    if not payload["items"]:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)

    store_settings = get_store_settings()

    try:
        with transaction.atomic():
            customer_defaults = {
                "first_name": payload["firstName"],
                "last_name": payload["lastName"],
                "phone": payload["phone"],
            }
            if payload["email"]:
                customer, _ = Customer.objects.update_or_create(email=payload["email"], defaults=customer_defaults)
            else:
                customer = Customer.objects.filter(email__isnull=True, phone=payload["phone"]).first()
                if customer:
                    for field, value in customer_defaults.items():
                        setattr(customer, field, value)
                    customer.save(update_fields=[*customer_defaults, "updated_at"])
                else:
                    customer = Customer.objects.create(email=None, **customer_defaults)

            subtotal = Decimal("0.00")
            prepared_items = []

            for item in payload["items"]:
                product_id = item.get("productId")
                variant_id = item.get("variantId")
                quantity = item["quantity"]

                product = Product.objects.select_for_update().get(id=product_id, status=Product.Status.ACTIVE)
                variant = None
                unit_price = product.price

                if variant_id:
                    variant = ProductVariant.objects.select_for_update().get(id=variant_id, product=product, is_active=True)
                    unit_price += variant.price_adjustment
                    if variant.stock_quantity < quantity:
                        raise ValueError(f"Not enough stock for {variant.sku}")
                elif product.variants.filter(is_active=True).exists():
                    raise ValueError("A colour and size selection is required")
                elif product.track_inventory and product.stock_quantity < quantity:
                    raise ValueError(f"Not enough stock for {product.sku}")

                line_total = unit_price * quantity
                subtotal += line_total
                prepared_items.append((product, variant, quantity, unit_price, line_total))

            delivery_fee = Decimal("0.00") if fulfillment == "pickup" else DELIVERY_FEES[delivery_area]
            total = subtotal + delivery_fee

            order = Order.objects.create(
                customer=customer,
                email=payload["email"],
                phone=payload["phone"],
                first_name=payload["firstName"],
                last_name=payload["lastName"],
                address=(
                    ", ".join(part for part in [payload["address"], payload["apartment"]] if part)
                    if fulfillment == "delivery"
                    else "Store pickup"
                ),
                city=payload["city"] if fulfillment == "delivery" else "Accra",
                postcode=payload["postalCode"] if fulfillment == "delivery" else "",
                country=payload["country"],
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total=total,
                currency=store_settings.currency,
                notes=f"Fulfillment: {fulfillment}. Delivery method: {DELIVERY_METHOD_NAMES.get(delivery_area, 'Store pickup')}. {payload['notes']}".strip(),
            )

            for product, variant, quantity, unit_price, line_total in prepared_items:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    variant=variant,
                    product_name=product.name,
                    sku=variant.sku if variant else product.sku,
                    selected_color=variant.color_name if variant else "",
                    selected_size=variant.size if variant else "",
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )

    except Product.DoesNotExist:
        return JsonResponse({"error": "One or more products are unavailable"}, status=400)
    except ProductVariant.DoesNotExist:
        return JsonResponse({"error": "One or more product variants are unavailable"}, status=400)
    except (ValueError, TypeError):
        return JsonResponse({"error": "The order contains invalid or unavailable items"}, status=400)

    reference = f"RS-{secrets.token_hex(18)}"
    order.paystack_reference = reference
    order.save(update_fields=["paystack_reference", "updated_at"])

    try:
        payment = initialize_transaction(
            email=order.email,
            amount=amount_in_subunits(order.total),
            currency=order.currency,
            reference=reference,
            callback_url=settings.PAYSTACK_CALLBACK_URL,
            order_number=order.order_number,
        )
    except PaystackError as exc:
        logger.exception(
            "Paystack initialization failed for order %s: %s",
            order.order_number,
            exc,
        )
        order.delete()
        configuration_messages = {
            "missing_secret_key": "Paystack secret key is missing from the Render environment.",
            "invalid_secret_key_format": (
                "Render has a public or malformed Paystack key. "
                "PAYSTACK_SECRET_KEY must contain an sk_test_ or sk_live_ secret key."
            ),
            "authentication_rejected": (
                "Paystack rejected the secret key configured in Render. "
                "Generate or copy a current secret key from the Paystack dashboard."
            ),
        }
        message = configuration_messages.get(
            exc.code,
            f"Paystack could not prepare payment: {exc}",
        )
        return JsonResponse(
            {"error": message, "code": exc.code},
            status=502,
        )

    return JsonResponse(
        {
            "order": {
                "orderNumber": order.order_number,
                "status": order.status,
                "paymentStatus": order.payment_status,
                "subtotal": str(order.subtotal),
                "deliveryFee": str(order.delivery_fee),
                "total": str(order.total),
                "currency": order.currency,
            },
            "payment": {
                "authorizationUrl": payment["authorization_url"],
                "reference": payment["reference"],
            },
        },
        status=201,
    )


@require_GET
def verify_paystack_payment(request: HttpRequest) -> JsonResponse:
    reference = request.GET.get("reference", "").strip()
    if not reference or len(reference) > 100:
        return JsonResponse({"error": "A valid payment reference is required"}, status=400)

    try:
        order = Order.objects.get(paystack_reference=reference)
        payment = verify_transaction(reference)
        order = mark_order_paid(order, payment)
    except Order.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=404)
    except PaystackError:
        return JsonResponse({"error": "Payment could not be verified. Please try again."}, status=502)
    except PaymentValidationError:
        return JsonResponse({"error": "Payment has not been completed."}, status=400)
    except (Product.DoesNotExist, ProductVariant.DoesNotExist, InventoryUnavailableError):
        Order.objects.filter(paystack_reference=reference).update(
            payment_status=Order.PaymentStatus.AUTHORIZED
        )
        return JsonResponse(
            {"error": "Payment was received, but the order needs manual review. Please contact us."},
            status=409,
        )

    return JsonResponse(
        {
            "order": {
                "orderNumber": order.order_number,
                "status": order.status,
                "paymentStatus": order.payment_status,
                "total": str(order.total),
                "currency": order.currency,
            }
        }
    )


@csrf_exempt
@require_POST
def paystack_webhook(request: HttpRequest) -> HttpResponse:
    if not settings.PAYSTACK_SECRET_KEY:
        return HttpResponse(status=503)

    expected_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
        request.body,
        hashlib.sha512,
    ).hexdigest()
    received_signature = request.headers.get("x-paystack-signature", "")
    if not hmac.compare_digest(expected_signature, received_signature):
        return HttpResponse(status=401)

    try:
        event = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return HttpResponse(status=400)

    if event.get("event") == "charge.success" and isinstance(event.get("data"), dict):
        payment = event["data"]
        reference = payment.get("reference")
        try:
            order = Order.objects.get(paystack_reference=reference)
            mark_order_paid(order, payment)
        except Order.DoesNotExist:
            pass
        except PaymentValidationError:
            pass
        except (Product.DoesNotExist, ProductVariant.DoesNotExist, InventoryUnavailableError):
            Order.objects.filter(paystack_reference=reference).update(
                payment_status=Order.PaymentStatus.AUTHORIZED
            )

    return HttpResponse(status=200)


@require_GET
def store_settings(request: HttpRequest) -> JsonResponse:
    settings = get_store_settings()
    return JsonResponse(
        {
            "store": {
                "name": settings.store_name,
                "supportEmail": settings.support_email,
                "supportPhone": settings.support_phone,
                "freeDeliveryThreshold": str(settings.free_delivery_threshold),
                "standardDeliveryFee": str(settings.standard_delivery_fee),
                "currency": settings.currency,
            }
        }
    )
