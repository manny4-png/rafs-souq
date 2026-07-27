from django.contrib import admin
from django.conf import settings
from django.db.models import F
from django.utils.html import format_html

from .forms import ProductAdminForm, ProductVariantAdminForm

from .models import (
    Category,
    Customer,
    InventoryMovement,
    Order,
    OrderItem,
    Product,
    ProductImage,
    ProductVariant,
    StoreSetting,
)


admin.site.site_header = "Raf's Souq Store Admin"
admin.site.site_title = "Raf's Souq Admin"
admin.site.index_title = "Store management"
admin.site.site_url = settings.FRONTEND_SITE_URL


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["preview", "image", "alt_text", "sort_order"]
    readonly_fields = ["preview"]
    verbose_name = "Gallery image"
    verbose_name_plural = "Gallery images"

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:64px;width:48px;object-fit:cover;border-radius:4px" />', obj.image.url)
        return "-"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    form = ProductVariantAdminForm
    extra = 3
    fields = ["sku", "color_name", "size", "price_adjustment", "stock_quantity", "is_active"]
    verbose_name = "Colour / size option"
    verbose_name_plural = "Colour and size options"


class InventoryMovementInline(admin.TabularInline):
    model = InventoryMovement
    extra = 0
    fields = ["quantity", "reason", "note", "created_by", "created_at"]
    readonly_fields = ["created_at"]
    classes = ["collapse"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active", "sort_order", "updated_at"]
    list_editable = ["is_active", "sort_order"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name", "description"]
    list_filter = ["is_active"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = [
        "thumbnail",
        "name",
        "sku",
        "category",
        "price",
        "status",
        "stock_quantity",
        "stock_state",
        "is_featured",
        "updated_at",
    ]
    list_editable = ["price", "status", "stock_quantity", "is_featured"]
    list_filter = ["status", "category", "badge", "is_featured", "track_inventory"]
    search_fields = ["name", "sku", "description", "tags"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["created_at", "updated_at", "published_at"]
    inlines = [ProductImageInline, ProductVariantInline, InventoryMovementInline]
    actions = ["mark_active", "mark_draft", "mark_featured", "clear_featured"]
    save_on_top = True
    list_per_page = 25
    list_select_related = ["category"]
    fieldsets = (
        ("Product basics", {"fields": ("name", "category", "sku", "description", "details_text", "tags_text", "main_image")} ),
        ("Price", {"fields": (("price", "compare_at_price"), "currency"), "description": "Leave the original price empty unless the product is on sale."}),
        ("Store visibility", {"fields": (("status", "badge"), "is_featured"), "description": "Set status to Active when the product is ready to appear in the shop."}),
        ("Stock", {"fields": ("track_inventory", ("stock_quantity", "low_stock_threshold"))}),
        ("Advanced", {"fields": ("slug", "published_at"), "classes": ("collapse",)}),
        ("Audit", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    class Media:
        css = {"all": ("store/admin.css",)}

    def thumbnail(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" style="height:56px;width:44px;object-fit:cover;border-radius:4px" />', obj.main_image.url)
        first = obj.images.first()
        if first:
            return format_html('<img src="{}" style="height:56px;width:44px;object-fit:cover;border-radius:4px" />', first.image.url)
        return "-"

    def stock_state(self, obj):
        if not obj.track_inventory:
            return "Not tracked"
        if obj.stock_quantity == 0:
            return format_html('<span style="color:#b91c1c;font-weight:600">Out</span>')
        if obj.is_low_stock:
            return format_html('<span style="color:#a16207;font-weight:600">Low</span>')
        return format_html('<span style="color:#166534;font-weight:600">In stock</span>')

    @admin.action(description="Mark selected products active")
    def mark_active(self, request, queryset):
        queryset.update(status=Product.Status.ACTIVE)

    @admin.action(description="Move selected products to draft")
    def mark_draft(self, request, queryset):
        queryset.update(status=Product.Status.DRAFT)

    @admin.action(description="Feature selected products")
    def mark_featured(self, request, queryset):
        queryset.update(is_featured=True)

    @admin.action(description="Remove selected products from featured")
    def clear_featured(self, request, queryset):
        queryset.update(is_featured=False)


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    form = ProductVariantAdminForm
    list_display = ["sku", "product", "color_name", "size", "stock_quantity", "is_active"]
    list_filter = ["is_active", "product__category"]
    search_fields = ["sku", "product__name", "color_name", "size"]
    list_editable = ["stock_quantity", "is_active"]
    exclude = ["color_hex"]


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ["product", "variant", "quantity", "reason", "created_by", "created_at"]
    list_filter = ["reason", "created_at"]
    search_fields = ["product__name", "variant__sku", "note"]
    readonly_fields = ["created_at", "updated_at"]

    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
        if not change:
            if obj.variant:
                ProductVariant.objects.filter(pk=obj.variant_id).update(stock_quantity=F("stock_quantity") + obj.quantity)
            Product.objects.filter(pk=obj.product_id).update(stock_quantity=F("stock_quantity") + obj.quantity)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "variant", "product_name", "sku", "selected_color", "selected_size", "quantity", "unit_price", "line_total"]
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "customer_name", "email", "status", "payment_status", "total", "created_at"]
    list_filter = ["status", "payment_status", "created_at", "city"]
    search_fields = ["order_number", "email", "first_name", "last_name", "phone", "paystack_reference"]
    readonly_fields = [
        "order_number",
        "subtotal",
        "delivery_fee",
        "total",
        "paystack_reference",
        "paystack_transaction_id",
        "payment_channel",
        "paid_at",
        "created_at",
        "updated_at",
    ]
    inlines = [OrderItemInline]
    actions = ["mark_paid", "mark_fulfilled", "mark_cancelled"]

    def customer_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    @admin.action(description="Mark selected orders paid")
    def mark_paid(self, request, queryset):
        queryset.update(status=Order.Status.PAID, payment_status=Order.PaymentStatus.PAID)

    @admin.action(description="Mark selected orders fulfilled")
    def mark_fulfilled(self, request, queryset):
        queryset.update(status=Order.Status.FULFILLED)

    @admin.action(description="Cancel selected orders")
    def mark_cancelled(self, request, queryset):
        queryset.update(status=Order.Status.CANCELLED)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["email", "first_name", "last_name", "phone", "created_at"]
    search_fields = ["email", "first_name", "last_name", "phone"]


@admin.register(StoreSetting)
class StoreSettingAdmin(admin.ModelAdmin):
    list_display = ["store_name", "support_email", "currency", "free_delivery_threshold", "standard_delivery_fee"]

    def has_add_permission(self, request):
        return not StoreSetting.objects.exists()
