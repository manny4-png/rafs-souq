from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("store", "0002_rename_store_order_order_n_aa22b2_idx_store_order_order_n_317f52_idx_and_more")]

    operations = [
        migrations.AlterField(
            model_name="storesetting",
            name="support_email",
            field=models.EmailField(default="rafssouqgh@gmail.com", max_length=254),
        ),
    ]
