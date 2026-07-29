from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail

from .models import Order, StoreSetting


logger = logging.getLogger(__name__)


def owner_notification_email() -> str:
    configured_email = settings.ORDER_NOTIFICATION_EMAIL.strip()
    if configured_email:
        return configured_email

    store_settings = StoreSetting.objects.only("support_email").first()
    return store_settings.support_email.strip() if store_settings else ""


def paid_order_notification_message(order: Order) -> str:
    item_lines = []
    for item in order.items.all():
        options = ", ".join(
            option
            for option in [
                item.selected_color,
                item.selected_size,
            ]
            if option
        )
        option_text = f" ({options})" if options else ""
        item_lines.append(
            f"- {item.quantity} x {item.product_name}{option_text} "
            f"[{item.sku}] — {order.currency} {item.line_total}"
        )

    return "\n".join(
        [
            f"Payment has been confirmed for order {order.order_number}.",
            "",
            f"Customer: {order.first_name} {order.last_name}",
            f"Email: {order.email or 'Not provided'}",
            f"Phone: {order.phone or 'Not provided'}",
            f"Address: {order.address}, {order.city}",
            f"Order total: {order.currency} {order.total}",
            f"Payment channel: {order.payment_channel or 'Paystack'}",
            f"Paystack reference: {order.paystack_reference}",
            "",
            "Items:",
            *item_lines,
            "",
            f"Open the Django admin to process order {order.order_number}.",
        ]
    )


def notify_owner_of_paid_order(order_id: int) -> None:
    try:
        order = Order.objects.prefetch_related("items").get(pk=order_id)
        recipient = owner_notification_email()
        if not recipient:
            logger.warning(
                "Paid order %s has no owner notification email configured.",
                order.order_number,
            )
            return

        send_mail(
            subject=f"Paid order {order.order_number} — {order.currency} {order.total}",
            message=paid_order_notification_message(order),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Could not send the paid order notification for order ID %s.", order_id)
