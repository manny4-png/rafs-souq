from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone

from .models import InventoryMovement, Order, Product, ProductVariant
from .notifications import notify_owner_of_paid_order


class PaymentValidationError(ValueError):
    pass


class InventoryUnavailableError(ValueError):
    pass


def amount_in_subunits(amount: Decimal) -> int:
    return int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


@transaction.atomic
def mark_order_paid(order: Order, payment: dict) -> Order:
    order = Order.objects.select_for_update().prefetch_related("items").get(pk=order.pk)
    if order.payment_status == Order.PaymentStatus.PAID:
        return order

    if payment.get("status") != "success":
        raise PaymentValidationError("Transaction is not successful")
    if payment.get("reference") != order.paystack_reference:
        raise PaymentValidationError("Transaction reference does not match")
    if payment.get("currency") != order.currency:
        raise PaymentValidationError("Transaction currency does not match")
    if payment.get("amount") != amount_in_subunits(order.total):
        raise PaymentValidationError("Transaction amount does not match")

    locked_products: dict[int, Product] = {}
    locked_variants: dict[int, ProductVariant] = {}
    items = list(order.items.all())

    for item in items:
        if not item.product_id:
            raise InventoryUnavailableError("An order product is no longer available")
        product = locked_products.get(item.product_id)
        if product is None:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            locked_products[item.product_id] = product

        if item.variant_id:
            variant = locked_variants.get(item.variant_id)
            if variant is None:
                variant = ProductVariant.objects.select_for_update().get(
                    pk=item.variant_id,
                    product_id=item.product_id,
                )
                locked_variants[item.variant_id] = variant
            if variant.stock_quantity < item.quantity:
                raise InventoryUnavailableError(f"Not enough stock for {item.sku}")
            variant.stock_quantity -= item.quantity

        if product.track_inventory:
            if product.stock_quantity < item.quantity:
                raise InventoryUnavailableError(f"Not enough stock for {item.sku}")
            product.stock_quantity -= item.quantity

    for variant in locked_variants.values():
        variant.save(update_fields=["stock_quantity", "updated_at"])
    for product in locked_products.values():
        if product.track_inventory:
            product.save(update_fields=["stock_quantity", "updated_at"])

    for item in items:
        InventoryMovement.objects.create(
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=-item.quantity,
            reason=InventoryMovement.Reason.SALE,
            note=f"Paystack payment for {order.order_number}",
        )

    order.payment_status = Order.PaymentStatus.PAID
    order.status = Order.Status.PAID
    order.paystack_transaction_id = str(payment.get("id", ""))
    order.payment_channel = str(payment.get("channel", ""))[:40]
    order.paid_at = timezone.now()
    order.save(
        update_fields=[
            "payment_status",
            "status",
            "paystack_transaction_id",
            "payment_channel",
            "paid_at",
            "updated_at",
        ]
    )
    transaction.on_commit(lambda: notify_owner_of_paid_order(order.pk))
    return order
