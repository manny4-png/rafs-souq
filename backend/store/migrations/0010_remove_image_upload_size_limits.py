from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0009_order_paystack_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="category",
            name="image",
            field=models.ImageField(blank=True, upload_to="categories/"),
        ),
        migrations.AlterField(
            model_name="product",
            name="main_image",
            field=models.ImageField(blank=True, upload_to="products/main/"),
        ),
        migrations.AlterField(
            model_name="productimage",
            name="image",
            field=models.ImageField(upload_to="products/gallery/"),
        ),
    ]
