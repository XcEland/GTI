from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

from .models import ExplorationProject


@admin.register(ExplorationProject)
class ExplorationProjectAdmin(GISModelAdmin):
    list_display = ("name", "commodity", "country", "status", "area_km2", "updated_at")
    list_filter = ("status", "commodity", "country")
    search_fields = ("name", "commodity", "country")
