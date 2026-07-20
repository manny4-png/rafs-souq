from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0005_limit_image_upload_sizes"),
    ]

    operations = [
        migrations.AlterField(
            model_name="customer",
            name="email",
            field=models.EmailField(blank=True, max_length=254, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name="order",
            name="email",
            field=models.EmailField(blank=True, max_length=254),
        ),
    ]
