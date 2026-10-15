# Generated for GeoTarget Intelligence Phase 1.

import django.contrib.gis.db.models.fields
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="ExplorationProject",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=160)),
                ("commodity", models.CharField(max_length=80)),
                ("country", models.CharField(max_length=80)),
                ("project_type", models.CharField(max_length=100)),
                ("description", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("planning", "Planning"), ("active", "Active"), ("review", "Under review"), ("archived", "Archived")], default="planning", max_length=20)),
                ("area_of_interest", django.contrib.gis.db.models.fields.PolygonField(srid=4326)),
                ("area_km2", models.DecimalField(decimal_places=3, default=0, editable=False, max_digits=14)),
                ("perimeter_km", models.DecimalField(decimal_places=3, default=0, editable=False, max_digits=14)),
                ("created_by", models.CharField(default="Demo Geologist", max_length=120)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("-updated_at", "name")},
        ),
    ]
