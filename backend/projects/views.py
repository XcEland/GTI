"""Project collection and detail endpoints."""

from rest_framework import mixins, viewsets

from .models import ExplorationProject
from .serializers import ExplorationProjectSerializer


class ExplorationProjectViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Create, list, and retrieve exploration projects."""

    queryset = ExplorationProject.objects.all()
    serializer_class = ExplorationProjectSerializer
