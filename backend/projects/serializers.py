"""REST representations and GeoJSON validation for exploration projects."""

import json

from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos.error import GEOSException
from rest_framework import serializers

from .models import ExplorationProject


class PolygonGeoJSONField(serializers.Field):
    """Convert between a GeoDjango polygon and a GeoJSON Polygon geometry."""

    default_error_messages = {
        "invalid": "Provide a valid GeoJSON Polygon geometry.",
        "geometry_type": "The project area must be a Polygon.",
        "coordinates": "AOI coordinates must be valid WGS 84 longitude/latitude values.",
    }

    def to_representation(self, value):
        return json.loads(value.geojson)

    def to_internal_value(self, data):
        geometry_data = data.get("geometry") if isinstance(data, dict) and data.get("type") == "Feature" else data
        try:
            geometry = GEOSGeometry(json.dumps(geometry_data), srid=4326)
        except (GEOSException, TypeError, ValueError):
            self.fail("invalid")

        if geometry.geom_type != "Polygon":
            self.fail("geometry_type")
        if geometry.empty or not geometry.valid:
            self.fail("invalid")

        min_x, min_y, max_x, max_y = geometry.extent
        if min_x < -180 or max_x > 180 or min_y < -90 or max_y > 90:
            self.fail("coordinates")
        geometry.srid = 4326
        return geometry


class ExplorationProjectSerializer(serializers.ModelSerializer):
    area_of_interest = PolygonGeoJSONField()
    coordinate_system = serializers.SerializerMethodField()
    vertex_count = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ExplorationProject
        fields = (
            "id", "name", "commodity", "country", "project_type", "description",
            "status", "status_label", "area_of_interest", "area_km2", "perimeter_km",
            "vertex_count", "coordinate_system", "created_by", "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "status", "area_km2", "perimeter_km", "created_by", "created_at", "updated_at",
        )

    def get_coordinate_system(self, _project):
        return "EPSG:4326"

    def get_vertex_count(self, project):
        # GeoJSON repeats the first coordinate to close a polygon ring.
        return max(0, len(project.area_of_interest.coords[0]) - 1)

    def validate_name(self, value):
        normalized = " ".join(value.split())
        if len(normalized) < 3:
            raise serializers.ValidationError("Project name must contain at least 3 characters.")
        return normalized
