import json
from unittest.mock import patch

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.http import HttpResponse
from django.test import RequestFactory, SimpleTestCase, override_settings

from .middleware import RequestSecurityMiddleware
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

    def test_phone_number_is_accepted_as_contact(self):
        payload = self.valid_payload()
        payload.pop("email")
        payload["contact"] = "+233 24 000 0000"
        cleaned = clean_order_payload(payload)
        self.assertEqual(cleaned["email"], "")
        self.assertEqual(cleaned["contact"], "+233 24 000 0000")
