from rest_framework.routers import DefaultRouter

from .views import ExplorationProjectViewSet

router = DefaultRouter()
router.register("projects", ExplorationProjectViewSet, basename="project")

urlpatterns = router.urls
