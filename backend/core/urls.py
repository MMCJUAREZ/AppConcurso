from django.contrib import admin
from django.urls import path
from core.views import health_check, db_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/db/', db_check, name='db_check'),
]