from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse


class AdminLoginRateLimitMiddleware:
    """Limit repeated admin login attempts per client address."""

    max_attempts = 5
    window_seconds = 15 * 60

    def __init__(self, get_response):
        self.get_response = get_response
        admin_path = "/" + settings.ADMIN_URL.strip("/")
        self.login_path = f"{admin_path}/login/"

    def __call__(self, request):
        if request.method != "POST" or request.path != self.login_path:
            return self.get_response(request)

        client_address = request.META.get("REMOTE_ADDR", "unknown")
        cache_key = f"admin-login-attempts:{client_address}"
        attempts = cache.get(cache_key, 0)
        if attempts >= self.max_attempts:
            return HttpResponse(
                "Too many login attempts. Please wait 15 minutes and try again.",
                status=429,
                content_type="text/plain",
            )

        response = self.get_response(request)
        if response.status_code in {301, 302, 303}:
            cache.delete(cache_key)
        else:
            cache.set(cache_key, attempts + 1, self.window_seconds)
        return response
