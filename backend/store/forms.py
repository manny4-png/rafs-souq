from django import forms

from .models import Product


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
