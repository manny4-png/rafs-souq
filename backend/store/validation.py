from __future__ import annotations

import re
import unicodedata

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.html import strip_tags


MAX_ITEMS = 25
MAX_QUANTITY = 20
PHONE_PATTERN = re.compile(r"^\+?[0-9][0-9 ()-]{6,24}$")
POSTAL_CODE_PATTERN = re.compile(r"^[A-Z0-9][A-Z0-9 -]{1,10}[A-Z0-9]$")


class PayloadValidationError(ValueError):
    pass


def clean_text(value, field: str, max_length: int, *, required: bool = True) -> str:
    if not isinstance(value, str):
        raise PayloadValidationError(f"{field} must be text")
    cleaned = unicodedata.normalize("NFKC", value).strip()
    if required and not cleaned:
        raise PayloadValidationError(f"{field} is required")
    if any(unicodedata.category(character) == "Cc" for character in cleaned):
        raise PayloadValidationError(f"{field} contains invalid characters")
    if strip_tags(cleaned) != cleaned:
        raise PayloadValidationError(f"{field} must not contain HTML")
    if len(cleaned) > max_length:
        raise PayloadValidationError(f"{field} is too long")
    return cleaned


def clean_order_payload(payload) -> dict:
    if not isinstance(payload, dict):
        raise PayloadValidationError("JSON payload must be an object")

    fulfillment = clean_text(payload.get("fulfillment", "delivery"), "fulfillment", 8)
    if fulfillment not in {"delivery", "pickup"}:
        raise PayloadValidationError("Invalid fulfillment method")

    contact = clean_text(payload.get("contact", payload.get("email", "")), "contact", 254)
    email = ""
    if "@" in contact:
        email = contact.lower()
        try:
            validate_email(email)
        except ValidationError as exc:
            raise PayloadValidationError("Enter a valid email address or phone number") from exc
    elif not PHONE_PATTERN.fullmatch(contact):
        raise PayloadValidationError("Enter a valid email address or phone number")

    phone = clean_text(payload.get("phone", ""), "phone", 25)
    if not PHONE_PATTERN.fullmatch(phone):
        raise PayloadValidationError("Enter a valid phone number")

    items = payload.get("items")
    if not isinstance(items, list) or not items:
        raise PayloadValidationError("Order must include at least one item")
    if len(items) > MAX_ITEMS:
        raise PayloadValidationError(f"Order cannot contain more than {MAX_ITEMS} items")

    clean_items = []
    for item in items:
        if not isinstance(item, dict):
            raise PayloadValidationError("Each order item must be an object")
        product_id = item.get("productId")
        variant_id = item.get("variantId")
        quantity = item.get("quantity")
        if isinstance(product_id, bool) or not isinstance(product_id, int) or product_id < 1:
            raise PayloadValidationError("Each item must have a valid productId")
        if variant_id is not None and (isinstance(variant_id, bool) or not isinstance(variant_id, int) or variant_id < 1):
            raise PayloadValidationError("variantId must be a positive integer")
        if isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= MAX_QUANTITY:
            raise PayloadValidationError(f"Item quantity must be between 1 and {MAX_QUANTITY}")
        clean_items.append({"productId": product_id, "variantId": variant_id, "quantity": quantity})

    is_delivery = fulfillment == "delivery"
    delivery_area = clean_text(payload.get("deliveryArea", ""), "deliveryArea", 80, required=is_delivery)
    country = clean_text(payload.get("country", "GH"), "country", 2).upper()
    if len(country) != 2 or not country.isalpha():
        raise PayloadValidationError("country must be a two-letter code")

    postal_code = clean_text(payload.get("postalCode", ""), "postalCode", 12, required=False).upper()
    if postal_code and not POSTAL_CODE_PATTERN.fullmatch(postal_code):
        raise PayloadValidationError("Enter a valid postal code for Ghana")

    return {
        "firstName": clean_text(payload.get("firstName", ""), "firstName", 80),
        "lastName": clean_text(payload.get("lastName", ""), "lastName", 80),
        "email": email,
        "contact": contact,
        "phone": phone,
        "address": clean_text(payload.get("address", ""), "address", 160, required=is_delivery),
        "apartment": clean_text(payload.get("apartment", ""), "apartment", 70, required=False),
        "city": clean_text(payload.get("city", ""), "city", 100, required=is_delivery),
        "postalCode": postal_code,
        "country": country,
        "deliveryArea": delivery_area,
        "fulfillment": fulfillment,
        "notes": clean_text(payload.get("notes", ""), "notes", 500, required=False),
        "items": clean_items,
    }
