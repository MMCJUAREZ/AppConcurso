import django_filters

from findings.models import FindingRecord


class FindingRecordFilter(django_filters.FilterSet):
    """
    Filtros básicos para búsqueda desde React.

    Estos filtros definen los parámetros que el frontend podrá mandar por URL.
    Ejemplos:
    /api/findings/?state=Ciudad de México
    /api/findings/?municipality=Iztapalapa
    /api/findings/?finding_type=bone_remains
    /api/findings/?finding_date_from=2026-05-01&finding_date_to=2026-05-16
    """

    finding_date_from = django_filters.DateFilter(
        field_name="finding_date",
        lookup_expr="gte",
    )
    finding_date_to = django_filters.DateFilter(
        field_name="finding_date",
        lookup_expr="lte",
    )

    class Meta:
        model = FindingRecord
        fields = [
            "status",
            "finding_type",
            "confidence_level",
            "country",
            "state",
            "municipality",
            "estimated_sex",
            "finding_date_from",
            "finding_date_to",
        ]