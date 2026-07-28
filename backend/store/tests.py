import hashlib
import hmac
import json
from decimal import Decimal
from io import BytesIO
from unittest.mock import patch
from urllib.error import HTTPError

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.http import HttpResponse
from django.test import RequestFactory, SimpleTestCase, TestCase, override_settings

from .middleware import RequestSecurityMiddleware
from .models import Category, InventoryMovement, Order, OrderItem, Product
from .payments import mark_order_paid
from .paystack import PaystackError, initialize_transaction
from .storage import CloudinaryMediaStorage
from .validation import PayloadValidationError, clean_order_payload


TEST_CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}


class CloudinaryMediaStorageTests(SimpleTestCase):
    @patch("store.storage.uploader.upload")
    def test_upload_returns_cloudinary_public_id(self, upload):
        upload.return_value = {"public_id": "rafs-souq/products/main/rose-abc123"}
        content = SimpleUploadedFile("rose.jpg", b"image-bytes", content_type="image/jpeg")

        name = CloudinaryMediaStorage().save("products/main/rose.jpg", content)

        self.assertEqual(name, "rafs-souq/products/main/rose-abc123")
        self.assertEqual(upload.call_args.kwargs["resource_type"], "image")
        self.assertFalse(upload.call_args.kwargs["overwrite"])

    @patch("store.storage.uploader.destroy")
    def test_delete_invalidates_cloudinary_asset(self, destroy):
        CloudinaryMediaStorage().delete("rafs-souq/products/main/rose-abc123")
        destroy.assert_called_once_with(
            "rafs-souq/products/main/rose-abc123",
            resource_type="image",
            invalidate=True,
        )


@override_settings(CACHES=TEST_CACHES, API_READ_RATE_LIMIT=2, API_WRITE_RATE_LIMIT=2, AUTH_RATE_LIMIT=5)
class RequestSecurityMiddlewareTests(SimpleTestCase):
    def setUp(self):
        cache.clear()

    def test_all_api_reads_are_rate_limited(self):
        self.assertEqual(self.client.get("/api/health/").status_code, 200)
        self.assertEqual(self.client.get("/api/health/").status_code, 200)
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response["Retry-After"], "900")

    def test_api_write_requires_json_content_type(self):
        response = self.client.post("/api/orders/", data="not-json", content_type="text/plain")
        self.assertEqual(response.status_code, 415)

    @override_settings(API_MAX_BODY_BYTES=16)
    def test_oversized_api_payload_is_rejected(self):
        response = self.client.post(
            "/api/orders/",
            data=json.dumps({"value": "x" * 100}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 413)

    def test_auth_is_limited_to_five_attempts(self):
        middleware = RequestSecurityMiddleware(lambda request: HttpResponse(status=401))
        factory = RequestFactory()
        for _ in range(5):
            request = factory.post(  # nosec B105 -- deliberately invalid test-only credential
                "/secure-admin/login/", {"username": "nobody", "password": "wrong"}  # nosec B105
            )
            self.assertNotEqual(middleware(request).status_code, 429)
        request = factory.post(  # nosec B105 -- deliberately invalid test-only credential
            "/secure-admin/login/", {"username": "nobody", "password": "wrong"}  # nosec B105
        )
        self.assertEqual(middleware(request).status_code, 429)


class OrderPayloadValidationTests(SimpleTestCase):
    def valid_payload(self):
        return {
            "firstName": "Ama",
            "lastName": "Mensah",
            "email": "ama@example.com",
            "phone": "+233 20 123 4567",
            "address": "1 Market Street",
            "apartment": "Suite 2",
            "city": "Accra",
            "postalCode": "GA-123-4567",
            "country": "GH",
            "deliveryArea": "within-accra",
            "fulfillment": "delivery",
            "items": [{"productId": 1, "quantity": 1}],
        }

    def test_html_is_rejected(self):
        payload = self.valid_payload()
        payload["firstName"] = "<script>alert(1)</script>"
        with self.assertRaises(PayloadValidationError):
            clean_order_payload(payload)

    def test_malformed_items_are_rejected(self):
        payload = self.valid_payload()
        payload["items"] = [{"productId": "1", "quantity": 1000}]
        with self.assertRaises(PayloadValidationError):
            clean_order_payload(payload)

    def test_unknown_objects_are_not_coerced_to_text(self):
        payload = self.valid_payload()
        payload["email"] = {"value": "ama@example.com"}
        with self.assertRaises(PayloadValidationError):
            clean_order_payload(payload)

    def test_email_is_required_for_paystack(self):
        payload = self.valid_payload()
        payload.pop("email")
        payload["contact"] = "+233 24 000 0000"
        with self.assertRaises(PayloadValidationError):
            clean_order_payload(payload)


@override_settings(CACHES=TEST_CACHES)
class CheckoutTokenTests(TestCase):
    def test_order_creation_rejects_missing_checkout_token_with_json(self):
        response = self.client.post(
            "/api/orders/",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertIn("expired", response.json()["error"].lower())

    def test_checkout_token_is_accepted_without_a_csrf_cookie(self):
        token = self.client.get("/api/csrf/").json()["csrfToken"]
        self.client.cookies.clear()
        response = self.client.post(
            "/api/orders/",
            data=json.dumps({}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response["Content-Type"], "application/json")


class PaystackClientTests(SimpleTestCase):
    @override_settings(PAYSTACK_SECRET_KEY="pk_test_public_key")
    def test_public_key_is_rejected_before_request(self):
        with self.assertRaises(PaystackError) as context:
            initialize_transaction(
                email="ama@example.com",
                amount=1000,
                currency="GHS",
                reference="RS-test",
                callback_url="https://example.com/payment/callback",
                order_number="RS-ORDER",
            )
        self.assertTrue(context.exception.configuration_error)
        self.assertEqual(context.exception.code, "invalid_secret_key_format")

    @override_settings(PAYSTACK_SECRET_KEY="sk_test_valid_shape")
    @patch("store.paystack.urlopen")
    def test_api_authentication_error_is_identified(self, urlopen):
        urlopen.side_effect = HTTPError(
            "https://api.paystack.co/transaction/initialize",
            401,
            "Unauthorized",
            hdrs=None,
            fp=BytesIO(b'{"status": false, "message": "Invalid key"}'),
        )

        with self.assertRaises(PaystackError) as context:
            initialize_transaction(
                email="ama@example.com",
                amount=1000,
                currency="GHS",
                reference="RS-test",
                callback_url="https://example.com/payment/callback",
                order_number="RS-ORDER",
            )
        self.assertTrue(context.exception.configuration_error)
        self.assertEqual(context.exception.code, "authentication_rejected")
        self.assertEqual(str(context.exception), "Invalid key")


@override_settings(CACHES=TEST_CACHES, PAYSTACK_SECRET_KEY="sk_test_webhook_secret")
class PaystackPaymentTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Turbans")
        self.product = Product.objects.create(
            category=category,
            name="Rose Turban",
            sku="ROSE-1",
            description="Test turban",
            price=Decimal("120.50"),
            currency="GHS",
            status=Product.Status.ACTIVE,
            stock_quantity=5,
        )
        self.order = Order.objects.create(
            email="ama@example.com",
            phone="+233 20 123 4567",
            first_name="Ama",
            last_name="Mensah",
            address="Store pickup",
            city="Accra",
            subtotal=Decimal("120.50"),
            total=Decimal("120.50"),
            currency="GHS",
            paystack_reference="RS-test-reference",
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            sku=self.product.sku,
            quantity=1,
            unit_price=Decimal("120.50"),
            line_total=Decimal("120.50"),
        )

    def payment(self, **overrides):
        data = {
            "id": 123456789,
            "status": "success",
            "reference": self.order.paystack_reference,
            "currency": "GHS",
            "amount": 12050,
            "channel": "mobile_money",
        }
        data.update(overrides)
        return data

    def test_successful_payment_marks_order_paid_and_deducts_stock_once(self):
        mark_order_paid(self.order, self.payment())
        mark_order_paid(self.order, self.payment())

        self.order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.PAID)
        self.assertEqual(self.order.status, Order.Status.PAID)
        self.assertEqual(self.product.stock_quantity, 4)
        self.assertEqual(InventoryMovement.objects.count(), 1)

    def test_payment_amount_must_match_order(self):
        with self.assertRaises(ValueError):
            mark_order_paid(self.order, self.payment(amount=100))
        self.order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.UNPAID)
        self.assertEqual(self.product.stock_quantity, 5)

    def test_webhook_rejects_invalid_signature(self):
        response = self.client.post(
            "/api/payments/paystack/webhook/",
            data=json.dumps({"event": "charge.success", "data": self.payment()}),
            content_type="application/json",
            HTTP_X_PAYSTACK_SIGNATURE="invalid",
        )
        self.assertEqual(response.status_code, 401)

    def test_signed_webhook_is_idempotent(self):
        body = json.dumps({"event": "charge.success", "data": self.payment()})
        signature = hmac.new(
            b"sk_test_webhook_secret",
            body.encode("utf-8"),
            hashlib.sha512,
        ).hexdigest()

        for _ in range(2):
            response = self.client.post(
                "/api/payments/paystack/webhook/",
                data=body,
                content_type="application/json",
                HTTP_X_PAYSTACK_SIGNATURE=signature,
            )
            self.assertEqual(response.status_code, 200)

        self.order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.PAID)
        self.assertEqual(self.product.stock_quantity, 4)
        self.assertEqual(InventoryMovement.objects.count(), 1)
