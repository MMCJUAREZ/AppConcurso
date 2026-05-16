from django.contrib import admin

from findings.models import FindingRecord


@admin.register(FindingRecord)
class FindingRecordAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para registros de hallazgos.

    El admin ayuda al equipo backend a revisar datos rápido durante desarrollo,
    sin depender todavía de que React tenga todas las pantallas terminadas.
    """

    list_display = [
        "record_code",
        "finding_type",
        "status",
        "state",
        "municipality",
        "finding_date",
        "created_at",
    ]
    list_filter = [
        "status",
        "finding_type",
        "confidence_level",
        "state",
        "estimated_sex",
    ]
    search_fields = [
        "record_code",
        "state",
        "municipality",
        "locality",
        "tattoos",
        "scars",
        "institutional_notes",
    ]
    readonly_fields = [
        "record_code",
        "created_at",
        "updated_at",
    ]