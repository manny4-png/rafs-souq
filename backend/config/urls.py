from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path
from django.urls import reverse_lazy

urlpatterns = [
    path(
        f"{settings.ADMIN_URL}password-reset/",
        auth_views.PasswordResetView.as_view(
            template_name="registration/password_reset_form.html",
            email_template_name="registration/admin_password_reset_email.txt",
            subject_template_name="registration/admin_password_reset_subject.txt",
            success_url=reverse_lazy("admin_password_reset_done"),
        ),
        name="admin_password_reset",
    ),
    path(
        f"{settings.ADMIN_URL}password-reset/done/",
        auth_views.PasswordResetDoneView.as_view(template_name="registration/password_reset_done.html"),
        name="admin_password_reset_done",
    ),
    path(
        f"{settings.ADMIN_URL}reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="registration/password_reset_confirm.html",
            success_url=reverse_lazy("admin_password_reset_complete"),
        ),
        name="admin_password_reset_confirm",
    ),
    path(
        f"{settings.ADMIN_URL}reset/done/",
        auth_views.PasswordResetCompleteView.as_view(template_name="registration/password_reset_complete.html"),
        name="admin_password_reset_complete",
    ),
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/", include("store.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
