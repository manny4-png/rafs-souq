from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("csrf/", views.csrf, name="csrf"),
    path("settings/", views.store_settings, name="store-settings"),
    path("categories/", views.categories, name="categories"),
    path("products/", views.products, name="products"),
    path("products/<slug:slug>/", views.product_detail, name="product-detail"),
    path("orders/", views.create_order, name="create-order"),
]
