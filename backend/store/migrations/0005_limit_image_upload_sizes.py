from django.db import migrations, models

import store.models


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0004_set_store_support_email"),
    ]

    operations = [
        migrations.AlterField(
            model_name="category",
            name="image",
            field=models.ImageField(
                blank=True,
                upload_to="categories/",
                validators=[store.models.validate_image_size],
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="main_image",
            field=models.ImageField(
                blank=True,
                upload_to="products/main/",
                validators=[store.models.validate_image_size],
            ),
        ),
        migrations.AlterField(
            model_name="productimage",
            name="image",
            field=models.ImageField(
                upload_to="products/gallery/",
                validators=[store.models.validate_image_size],
            ),
        ),
    ]
