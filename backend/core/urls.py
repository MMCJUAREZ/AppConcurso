from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.views import db_check, health_check


urlpatterns = [
    path("admin/", admin.site.urls),

    # Endpoints técnicos básicos para validar que backend y base de datos responden.
    path("api/health/", health_check, name="health_check"),
    path("api/db/", db_check, name="db_check"),

    # Documentación automática de la API.
    # Frontend puede usar /api/docs/ para revisar rutas, métodos y payloads.
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),

    # Endpoints funcionales del sistema.
    path("api/", include("findings.urls")),
]