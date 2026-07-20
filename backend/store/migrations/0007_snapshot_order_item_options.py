from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0006_allow_phone_only_checkout"),
    ]

    operations = [
        migrations.AddField(
            model_name="orderitem",
            name="selected_color",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="selected_size",
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
