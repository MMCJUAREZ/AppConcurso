from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from findings.filters import FindingRecordFilter
from findings.models import FindingRecord
from findings.serializers import (
    FindingRecordCreateUpdateSerializer,
    FindingRecordDetailSerializer,
    FindingRecordListSerializer,
)


class FindingRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal de registros de hallazgos.

    Expone los endpoints REST del MVP:
    - GET /api/findings/
    - POST /api/findings/
    - GET /api/findings/<id>/
    - PATCH /api/findings/<id>/
    - DELETE /api/findings/<id>/

    Nota de seguridad:
    AllowAny se usa temporalmente para desarrollo e integración rápida con React.
    Antes de un despliegue real debe cambiarse por IsAuthenticated y permisos
    específicos por rol o colectivo.
    """

    queryset = FindingRecord.objects.select_related("created_by").all()
    permission_classes = [AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = FindingRecordFilter

    # Búsqueda textual general. React puede usarla con:
    # /api/findings/?search=tatuaje
    search_fields = [
        "record_code",
        "state",
        "municipality",
        "locality",
        "region",
        "tattoos",
        "scars",
        "moles",
        "prosthetics",
        "surgical_marks",
        "institutional_notes",
    ]

    # Campos permitidos para ordenamiento desde frontend.
    # Ejemplo: /api/findings/?ordering=finding_date
    ordering_fields = [
        "created_at",
        "updated_at",
        "finding_date",
        "state",
        "municipality",
    ]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        """
        Selecciona un serializer distinto según la acción.

        Esto permite que la lista sea ligera, la ficha sea completa y la
        creación/edición tenga reglas propias de escritura.
        """

        if self.action == "list":
            return FindingRecordListSerializer

        if self.action in ["create", "update", "partial_update"]:
            return FindingRecordCreateUpdateSerializer

        return FindingRecordDetailSerializer

    def perform_create(self, serializer):
        """
        Asocia el registro con la usuaria autenticada cuando exista login.

        Por ahora, si no hay autenticación, el registro se guarda sin created_by.
        Esto permite avanzar con el MVP sin bloquear la integración con React.
        """

        user = self.request.user

        if user.is_authenticated:
            serializer.save(created_by=user)
        else:
            serializer.save()

    @action(detail=False, methods=["get"], url_path="catalogs")
    def catalogs(self, request):
        """
        Devuelve catálogos simples para formularios de React.

        Este endpoint evita que frontend tenga que escribir manualmente valores
        internos como "bone_remains", "in_review" o "unknown". Backend conserva
        el control de los valores válidos y React solo los consume para llenar
        selectores.
        """

        return Response(
            {
                "record_status": [
                    {"value": value, "label": label}
                    for value, label in FindingRecord.RecordStatus.choices
                ],
                "finding_type": [
                    {"value": value, "label": label}
                    for value, label in FindingRecord.FindingType.choices
                ],
                "confidence_level": [
                    {"value": value, "label": label}
                    for value, label in FindingRecord.ConfidenceLevel.choices
                ],
                "estimated_sex": [
                    {"value": value, "label": label}
                    for value, label in FindingRecord.EstimatedSex.choices
                ],
            }
        )            