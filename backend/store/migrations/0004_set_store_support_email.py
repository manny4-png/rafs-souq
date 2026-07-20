from django.db import migrations, models


NEW_SUPPORT_EMAIL = "rafssouqgh@gmail.com"


def update_store_support_email(apps, schema_editor):
    StoreSetting = apps.get_model("store", "StoreSetting")
    StoreSetting.objects.update(support_email=NEW_SUPPORT_EMAIL)


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0003_update_support_email_default"),
    ]

    operations = [
        migrations.AlterField(
            model_name="storesetting",
            name="support_email",
            field=models.EmailField(default=NEW_SUPPORT_EMAIL, max_length=254),
        ),
        migrations.RunPython(update_store_support_email, migrations.RunPython.noop),
    ]
