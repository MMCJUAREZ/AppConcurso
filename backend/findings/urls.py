from django.urls import include, path
from rest_framework.routers import DefaultRouter

from findings.views import FindingRecordViewSet


# El router genera automáticamente las rutas REST del recurso findings.
# Esto facilita que React tenga endpoints consistentes y documentables.
router = DefaultRouter()
router.register(r"findings", FindingRecordViewSet, basename="finding")

urlpatterns = [
    path("", include(router.urls)),
]