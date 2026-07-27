from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings


PAYSTACK_API_URL = "https://api.paystack.co"


class PaystackError(Exception):
    """Raised when Paystack cannot initialize or verify a transaction."""


def _request(path: str, *, method: str = "GET", payload: dict | None = None) -> dict:
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError("Paystack is not configured")

    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        f"{PAYSTACK_API_URL}{path}",
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=15) as response:
            result = json.load(response)
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise PaystackError("Could not communicate with Paystack") from exc

    if not result.get("status") or not isinstance(result.get("data"), dict):
        raise PaystackError(result.get("message", "Paystack request failed"))
    return result["data"]


def initialize_transaction(
    *,
    email: str,
    amount: int,
    currency: str,
    reference: str,
    callback_url: str,
    order_number: str,
) -> dict:
    return _request(
        "/transaction/initialize",
        method="POST",
        payload={
            "email": email,
            "amount": str(amount),
            "currency": currency,
            "reference": reference,
            "callback_url": callback_url,
            "metadata": {"order_number": order_number},
        },
    )


def verify_transaction(reference: str) -> dict:
    return _request(f"/transaction/verify/{quote(reference, safe='')}")
