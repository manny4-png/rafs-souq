from __future__ import annotations

import json
from decimal import Decimal

from django.db import transaction
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET, require_POST

from .models import Category, Customer, Order, OrderItem, Product, ProductVariant, StoreSetting


DELIVERY_FEES = {
    "Klagon": Decimal("28.00"),
    "Ashaiman Central": Decimal("35.00"), "Sakumono": Decimal("35.00"),
    "Spintex": Decimal("38.00"),
    "Nungua": Decimal("40.00"), "East Legon": Decimal("40.00"), "Accra Mall": Decimal("40.00"), "Borteyman": Decimal("40.00"),
    "Teshie": Decimal("42.00"),
    "Ashaiman Outskirts": Decimal("45.00"), "East Legon Hills": Decimal("45.00"), "Osu": Decimal("45.00"),
    "Palace Mall": Decimal("45.00"), "Labadi": Decimal("45.00"), "Haatso": Decimal("45.00"),
    "37 Military": Decimal("45.00"), "School Junction": Decimal("45.00"), "Embassy Gardens": Decimal("45.00"),
    "Legon": Decimal("45.00"), "Tse Addo": Decimal("45.00"),
    "Dome": Decimal("50.00"), "Nima": Decimal("50.00"), "Pig Farm": Decimal("50.00"), "Madina": Decimal("50.00"),
    "Adenta": Decimal("50.00"), "Airport Area": Decimal("50.00"), "Kwabenya": Decimal("50.00"),
    "Accra Tudu": Decimal("50.00"), "Darkuman": Decimal("50.00"), "UPSA": Decimal("50.00"),
    "Lakeside": Decimal("50.00"), "Ministries": Decimal("50.00"),
    "Pantang": Decimal("60.00"), "Kasoa": Decimal("80.00"),
}


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
    return JsonResponse({"csrfToken": get_token(request)})


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
        queryset = queryset.filter(category__slug=category)

    featured = request.GET.get("featured")
    if featured in {"1", "true", "True"}:
        queryset = queryset.filter(is_featured=True)

    search = request.GET.get("search", "").strip()
    if search:
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
    return StoreSetting.objects.create()


@require_POST
@csrf_protect
def create_order(request: HttpRequest) -> JsonResponse:
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)

    fulfillment = payload.get("fulfillment", "delivery")
    required_fields = ["firstName", "lastName", "email", "phone", "items"]
    if fulfillment == "delivery":
        required_fields.extend(["address", "city", "deliveryArea"])
    missing = [field for field in required_fields if not payload.get(field)]
    if missing:
        return JsonResponse({"error": "Missing required fields", "fields": missing}, status=400)

    if not isinstance(payload["items"], list) or not payload["items"]:
        return JsonResponse({"error": "Order must include at least one item"}, status=400)

    if fulfillment not in {"delivery", "pickup"}:
        return JsonResponse({"error": "Invalid fulfillment method"}, status=400)

    delivery_area = payload.get("deliveryArea", "").strip()
    if fulfillment == "delivery" and delivery_area not in DELIVERY_FEES:
        return JsonResponse({"error": "Please select a valid delivery area"}, status=400)

    store_settings = get_store_settings()

    try:
        with transaction.atomic():
            customer, _ = Customer.objects.update_or_create(
                email=payload["email"].strip().lower(),
                defaults={
                    "first_name": payload["firstName"].strip(),
                    "last_name": payload["lastName"].strip(),
                    "phone": payload["phone"].strip(),
                },
            )

            subtotal = Decimal("0.00")
            prepared_items = []

            for item in payload["items"]:
                product_id = item.get("productId")
                variant_id = item.get("variantId")
                quantity = int(item.get("quantity", 0))
                if quantity < 1:
                    raise ValueError("Item quantity must be at least 1")

                product = Product.objects.select_for_update().get(id=product_id, status=Product.Status.ACTIVE)
                variant = None
                unit_price = product.price

                if variant_id:
                    variant = ProductVariant.objects.select_for_update().get(id=variant_id, product=product, is_active=True)
                    unit_price += variant.price_adjustment
                    if variant.stock_quantity < quantity:
                        raise ValueError(f"Not enough stock for {variant.sku}")
                elif product.track_inventory and product.stock_quantity < quantity:
                    raise ValueError(f"Not enough stock for {product.sku}")

                line_total = unit_price * quantity
                subtotal += line_total
                prepared_items.append((product, variant, quantity, unit_price, line_total))

            delivery_fee = Decimal("0.00") if fulfillment == "pickup" else DELIVERY_FEES[delivery_area]
            total = subtotal + delivery_fee

            order = Order.objects.create(
                customer=customer,
                email=customer.email,
                phone=payload["phone"].strip(),
                first_name=payload["firstName"].strip(),
                last_name=payload["lastName"].strip(),
                address=payload.get("address", "").strip() if fulfillment == "delivery" else "Store pickup",
                city=payload.get("city", "").strip() if fulfillment == "delivery" else "Accra",
                postcode="",
                country=payload.get("country", "GH").strip()[:2].upper(),
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total=total,
                currency=store_settings.currency,
                notes=f"Fulfillment: {fulfillment}. Delivery area: {delivery_area or 'Store pickup'}. {payload.get('notes', '').strip()}".strip(),
            )

            for product, variant, quantity, unit_price, line_total in prepared_items:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    variant=variant,
                    product_name=product.name,
                    sku=variant.sku if variant else product.sku,
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )

                if variant:
                    variant.stock_quantity -= quantity
                    variant.save(update_fields=["stock_quantity", "updated_at"])

                if product.track_inventory:
                    product.stock_quantity -= quantity
                    product.save(update_fields=["stock_quantity", "updated_at"])

    except Product.DoesNotExist:
        return JsonResponse({"error": "One or more products are unavailable"}, status=400)
    except ProductVariant.DoesNotExist:
        return JsonResponse({"error": "One or more product variants are unavailable"}, status=400)
    except (ValueError, TypeError) as exc:
        return JsonResponse({"error": str(exc)}, status=400)

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
            }
        },
        status=201,
    )


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
