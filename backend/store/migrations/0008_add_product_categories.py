from django.db import migrations
from django.utils.text import slugify


NEW_CATEGORIES = [
    ("Ladies Accessories", "Finishing touches designed to elevate everyday and occasion looks.", 5),
    ("Kids Turbans", "Comfortable, easy-to-wear turbans made especially for little ones.", 6),
    ("Headbands", "Versatile headbands that bring effortless polish to every outfit.", 7),
]


def add_categories(apps, schema_editor):
    Category = apps.get_model("store", "Category")
    for name, description, sort_order in NEW_CATEGORIES:
        Category.objects.update_or_create(
            name=name,
            defaults={
                "slug": slugify(name),
                "description": description,
                "sort_order": sort_order,
                "is_active": True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0007_snapshot_order_item_options"),
    ]

    operations = [
        migrations.RunPython(add_categories, migrations.RunPython.noop),
    ]
