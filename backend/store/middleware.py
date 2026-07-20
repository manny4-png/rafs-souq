from __future__ import annotations

import hashlib

from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse, JsonResponse


class RequestSecurityMiddleware:
    """Apply request size, content type, and rate limits before views run."""

    window_seconds = 15 * 60

    def __init__(self, get_response):
        self.get_response = get_response
        self.admin_path = "/" + settings.ADMIN_URL.strip("/") + "/"

    def __call__(self, request):
        rejection = self._validate_request(request)
        if rejection:
            return rejection

        limit, scope = self._limit_for(request)
        if limit and self._increment(request, scope) > limit:
            response = self._error(request, "Too many requests. Please try again in 15 minutes.", 429)
            response["Retry-After"] = str(self.window_seconds)
            return response

        return self.get_response(request)

    def _validate_request(self, request):
        raw_length = request.META.get("CONTENT_LENGTH", "")
        try:
            content_length = int(raw_length) if raw_length else 0
        except (TypeError, ValueError):
            return self._error(request, "Invalid Content-Length header.", 400)

        if content_length < 0:
            return self._error(request, "Invalid Content-Length header.", 400)

        if request.path.startswith("/api/") and content_length > settings.API_MAX_BODY_BYTES:
            return self._error(request, "Request payload is too large.", 413)

        if request.path.startswith("/api/") and request.method in {"POST", "PUT", "PATCH"}:
            content_type = request.content_type.lower()
            if content_type != "application/json":
                return self._error(request, "Content-Type must be application/json.", 415)
        return None

    def _limit_for(self, request):
        is_auth_attempt = request.method == "POST" and request.path.startswith(self.admin_path) and (
            request.path.endswith("/login/")
            or "password-reset" in request.path
            or "/reset/" in request.path
        )
        if is_auth_attempt:
            return settings.AUTH_RATE_LIMIT, "auth"
        if request.path.startswith("/api/"):
            if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
                return settings.API_WRITE_RATE_LIMIT, "api-write"
            return settings.API_READ_RATE_LIMIT, "api-read"
        if request.path.startswith(self.admin_path):
            return settings.ADMIN_RATE_LIMIT, "admin"
        return 0, ""

    def _increment(self, request, scope):
        address = request.META.get("REMOTE_ADDR") or "unknown"
        identity = hashlib.sha256(address.encode("utf-8", errors="ignore")).hexdigest()
        key = f"rate-limit:{scope}:{identity}"
        if cache.add(key, 1, timeout=self.window_seconds):
            return 1
        try:
            return cache.incr(key)
        except ValueError:
            cache.set(key, 1, timeout=self.window_seconds)
            return 1

    @staticmethod
    def _error(request, message, status):
        if request.path.startswith("/api/"):
            return JsonResponse({"error": message}, status=status)
        return HttpResponse(message, status=status, content_type="text/plain; charset=utf-8")
