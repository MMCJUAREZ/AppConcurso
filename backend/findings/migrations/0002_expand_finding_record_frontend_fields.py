from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("findings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="findingrecord",
            name="internal_notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="temporal_range",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="amputations",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="braces",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="dental_prosthetics",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="missing_teeth",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="dental_restorations",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="notified_authority",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="institutional_folio",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="case_reference",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="findingrecord",
            name="semefo",
            field=models.CharField(blank=True, max_length=150),
        ),
    ]