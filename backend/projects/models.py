"""Spatial domain models for exploration projects."""

import uuid
from decimal import Decimal

from django.contrib.gis.db import models


class ExplorationProject(models.Model):
    """A project and its authoritative area of interest.

    Browser GeoJSON is accepted in WGS 84 (EPSG:4326). Metric values are derived
    in the local UTM zone selected from the polygon centroid, avoiding calculations
    in angular degrees while remaining suitable for project-scale AOIs.
    """

    class Status(models.TextChoices):
        PLANNING = "planning", "Planning"
        ACTIVE = "active", "Active"
        REVIEW = "review", "Under review"
        ARCHIVED = "archived", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)
    commodity = models.CharField(max_length=80)
    country = models.CharField(max_length=80)
    project_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    area_of_interest = models.PolygonField(srid=4326)
    area_km2 = models.DecimalField(max_digits=14, decimal_places=3, editable=False, default=0)
    perimeter_km = models.DecimalField(max_digits=14, decimal_places=3, editable=False, default=0)
    created_by = models.CharField(max_length=120, default="Demo Geologist")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at", "name")

    def __str__(self) -> str:
        return self.name

    def _update_spatial_metrics(self) -> None:
        """Calculate metric AOI values using the centroid's UTM zone."""

        if not self.area_of_interest or self.area_of_interest.empty:
            self.area_km2 = Decimal("0")
            self.perimeter_km = Decimal("0")
            return

        longitude = self.area_of_interest.centroid.x
        latitude = self.area_of_interest.centroid.y
        zone = max(1, min(60, int((longitude + 180) // 6) + 1))
        utm_srid = (32600 if latitude >= 0 else 32700) + zone
        projected = self.area_of_interest.clone()
        projected.transform(utm_srid)
        self.area_km2 = Decimal(str(round(projected.area / 1_000_000, 3)))
        self.perimeter_km = Decimal(str(round(projected.length / 1_000, 3)))

    def save(self, *args, **kwargs):
        self._update_spatial_metrics()
        return super().save(*args, **kwargs)
