from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0008_add_product_categories"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="paid_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="payment_channel",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="order",
            name="paystack_reference",
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="order",
            name="paystack_transaction_id",
            field=models.CharField(blank=True, max_length=40),
        ),
    ]
