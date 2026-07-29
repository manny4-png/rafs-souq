from __future__ import annotations

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


def validate_image_size(image):
    """Legacy validator retained only so historical migration 0005 can load."""
    if image.size > 5 * 1024 * 1024:
        raise ValidationError("Images must be 5 MB or smaller.")


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"

    class Badge(models.TextChoices):
        NONE = "", "None"
        NEW = "New", "New"
        SALE = "Sale", "Sale"
        BESTSELLER = "Bestseller", "Bestseller"
        EXCLUSIVE = "Exclusive", "Exclusive"
        LIMITED = "Limited", "Limited"

    category = models.ForeignKey(Category, related_name="products", on_delete=models.PROTECT)
    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    sku = models.CharField(max_length=64, unique=True)
    description = models.TextField()
    details = models.JSONField(default=list, blank=True, help_text="List of product detail strings.")
    tags = models.JSONField(default=list, blank=True, help_text="List of searchable tags.")
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    compare_at_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    currency = models.CharField(max_length=3, default="GHS")
    main_image = models.ImageField(upload_to="products/main/", blank=True)
    badge = models.CharField(max_length=24, choices=Badge.choices, blank=True, default=Badge.NONE)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False)
    track_inventory = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=3)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-published_at", "name"]
        indexes = [
            models.Index(fields=["status", "slug"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["is_featured", "status"]),
        ]

    def __str__(self) -> str:
        return self.name

    @property
    def is_in_stock(self) -> bool:
        return not self.track_inventory or self.stock_quantity > 0

    @property
    def is_low_stock(self) -> bool:
        return self.track_inventory and 0 < self.stock_quantity <= self.low_stock_threshold

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if self.status == self.Status.ACTIVE and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=180, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return self.alt_text or f"Image for {self.product}"


class ProductVariant(TimeStampedModel):
    product = models.ForeignKey(Product, related_name="variants", on_delete=models.CASCADE)
    color_name = models.CharField(max_length=80, blank=True)
    color_hex = models.CharField(max_length=7, blank=True)
    size = models.CharField(max_length=50, blank=True)
    sku = models.CharField(max_length=80, unique=True)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    stock_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["product", "color_name", "size"]

    def __str__(self) -> str:
        pieces = [self.product.name, self.color_name, self.size]
        return " - ".join(piece for piece in pieces if piece)


class InventoryMovement(TimeStampedModel):
    class Reason(models.TextChoices):
        RESTOCK = "restock", "Restock"
        SALE = "sale", "Sale"
        RETURN = "return", "Return"
        ADJUSTMENT = "adjustment", "Adjustment"
        DAMAGE = "damage", "Damage"

    product = models.ForeignKey(Product, related_name="inventory_movements", on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, related_name="inventory_movements", null=True, blank=True, on_delete=models.CASCADE)
    quantity = models.IntegerField(help_text="Positive for stock added, negative for stock removed.")
    reason = models.CharField(max_length=24, choices=Reason.choices)
    note = models.CharField(max_length=240, blank=True)
    created_by = models.ForeignKey("auth.User", null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.product} {self.quantity:+d} ({self.reason})"


class Customer(TimeStampedModel):
    email = models.EmailField(unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    phone = models.CharField(max_length=40, blank=True)

    class Meta:
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email or self.phone


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        AUTHORIZED = "authorized", "Authorized"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    order_number = models.CharField(max_length=32, unique=True, editable=False)
    customer = models.ForeignKey(Customer, related_name="orders", null=True, blank=True, on_delete=models.SET_NULL)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    address = models.CharField(max_length=240)
    city = models.CharField(max_length=100)
    postcode = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=2, default="GH")
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=24, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=3, default="GHS")
    notes = models.TextField(blank=True)
    paystack_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    paystack_transaction_id = models.CharField(max_length=40, blank=True)
    payment_channel = models.CharField(max_length=40, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order_number"]),
            models.Index(fields=["email"]),
            models.Index(fields=["status", "payment_status"]),
        ]

    def __str__(self) -> str:
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
            suffix = Order.objects.count() + 1
            self.order_number = f"RS-{timestamp}-{suffix:04d}"
        super().save(*args, **kwargs)


class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="order_items", null=True, blank=True, on_delete=models.SET_NULL)
    variant = models.ForeignKey(ProductVariant, related_name="order_items", null=True, blank=True, on_delete=models.SET_NULL)
    product_name = models.CharField(max_length=180)
    sku = models.CharField(max_length=80)
    selected_color = models.CharField(max_length=80, blank=True)
    selected_size = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.quantity} x {self.product_name}"


class StoreSetting(TimeStampedModel):
    store_name = models.CharField(max_length=120, default="Raf's Souq")
    support_email = models.EmailField(default="rafssouqgh@gmail.com")
    support_phone = models.CharField(max_length=40, blank=True)
    free_delivery_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("750.00"))
    standard_delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("45.00"))
    currency = models.CharField(max_length=3, default="GHS")

    class Meta:
        verbose_name = "store setting"
        verbose_name_plural = "store settings"

    def __str__(self) -> str:
        return self.store_name
