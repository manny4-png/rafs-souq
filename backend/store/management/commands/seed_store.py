from django.core.management.base import BaseCommand

from store.models import Category, StoreSetting


class Command(BaseCommand):
    help = "Create the default Raf's Souq store settings and product categories."

    def handle(self, *args, **options):
        if not StoreSetting.objects.exists():
            StoreSetting.objects.create(
                store_name="Raf's Souq",
                support_email="rafssouqgh@gmail.com",
                currency="GHS",
            )

        categories = [
            ("Turbans", "The signature Raf's Souq product: sculpted, comfortable, and ready in seconds.", 1),
            ("Shades", "Polished frames designed to complete every modest wardrobe.", 2),
            ("Veils", "Lightweight chiffon and satin veils for everyday and occasion dressing.", 3),
            ("Ready to Wear Dresses", "Modest dresses with graceful silhouettes and effortless movement.", 4),
            ("Ladies Accessories", "Finishing touches designed to elevate everyday and occasion looks.", 5),
            ("Kids Turbans", "Comfortable, easy-to-wear turbans made especially for little ones.", 6),
            ("Headbands", "Versatile headbands that bring effortless polish to every outfit.", 7),
        ]

        for name, description, sort_order in categories:
            Category.objects.update_or_create(
                name=name,
                defaults={
                    "description": description,
                    "sort_order": sort_order,
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("Seeded Raf's Souq store defaults."))
