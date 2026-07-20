from django import forms
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags

from .models import Product, ProductVariant


class ProductVariantAdminForm(forms.ModelForm):
    size = forms.CharField(
        required=False,
        help_text="Enter any size used by this product, for example S, M, L, 32, 34, or 40.",
        widget=forms.TextInput(attrs={"placeholder": "e.g. M or 34"}),
    )

    class Meta:
        model = ProductVariant
        fields = "__all__"


class ProductAdminForm(forms.ModelForm):
    details_text = forms.CharField(
        label="Product details",
        required=False,
        widget=forms.Textarea(attrs={"rows": 5, "placeholder": "Enter one product detail per line"}),
        help_text="One detail per line, for example: Soft stretch fabric",
    )
    tags_text = forms.CharField(
        label="Search tags",
        required=False,
        widget=forms.TextInput(attrs={"placeholder": "turban, pink, occasion"}),
        help_text="Separate tags with commas. These help customers find the product.",
    )

    class Meta:
        model = Product
        exclude = ("details", "tags")
        widgets = {
            "description": forms.Textarea(attrs={"rows": 5, "placeholder": "Describe the product, fit, fabric and styling."}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields["details_text"].initial = "\n".join(self.instance.details or [])
            self.fields["tags_text"].initial = ", ".join(self.instance.tags or [])

    def save(self, commit=True):
        product = super().save(commit=False)
        product.details = [line.strip() for line in self.cleaned_data["details_text"].splitlines() if line.strip()]
        product.tags = [tag.strip() for tag in self.cleaned_data["tags_text"].split(",") if tag.strip()]
        if commit:
            product.save()
            self.save_m2m()
        return product

    def clean_description(self):
        return self._clean_plain_text(self.cleaned_data["description"], "Description", 5000)

    def clean_details_text(self):
        value = self._clean_plain_text(self.cleaned_data["details_text"], "Product details", 4000)
        if len([line for line in value.splitlines() if line.strip()]) > 50:
            raise ValidationError("Enter no more than 50 product details.")
        return value

    def clean_tags_text(self):
        value = self._clean_plain_text(self.cleaned_data["tags_text"], "Search tags", 1000)
        if len([tag for tag in value.split(",") if tag.strip()]) > 30:
            raise ValidationError("Enter no more than 30 search tags.")
        return value

    @staticmethod
    def _clean_plain_text(value, label, max_length):
        value = value.strip()
        if strip_tags(value) != value:
            raise ValidationError(f"{label} must not contain HTML.")
        if len(value) > max_length:
            raise ValidationError(f"{label} is too long.")
        return value
