from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    """Provide a dependency-light readiness endpoint for local development."""

    return JsonResponse({"status": "ok", "service": "geotarget-api"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/", include("projects.urls")),
]

