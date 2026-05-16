from rest_framework import serializers

from findings.models import FindingRecord


class FindingRecordListSerializer(serializers.ModelSerializer):
    """
    Serializer para la vista de lista.

    Este serializer devuelve solo los campos necesarios para mostrar una tabla,
    tarjetas o listado en React. No incluye todos los campos sensibles ni todos
    los campos largos porque la lista debe ser ligera y rápida de consultar.
    """

    finding_type_display = serializers.CharField(
        source="get_finding_type_display",
        read_only=True,
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    estimated_sex_display = serializers.CharField(
        source="get_estimated_sex_display",
        read_only=True,
    )
    created_by_username = serializers.SerializerMethodField()

    def get_created_by_username(self, obj):
        """
        Devuelve el nombre de la usuaria que creó el registro.

        Por ahora puede regresar None porque el MVP todavía permite crear registros
        sin autenticación. Mantener este campo en la respuesta ayuda a que React no
        tenga que cambiar la estructura del listado cuando agreguemos login.
        """
        if obj.created_by:
            return obj.created_by.username

        return None

    class Meta:
        model = FindingRecord
        fields = [
            "id",
            "record_code",
            "status",
            "status_display",
            "finding_type",
            "finding_type_display",
            "state",
            "municipality",
            "finding_date",
            "estimated_sex",
            "estimated_sex_display",
            "estimated_age",
            "estimated_height",
            "tattoos",
            "scars",
            "prosthetics",
            "contact_email",
            "created_by_username",
            "created_at",
            "updated_at",
        ]


class FindingRecordDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para la ficha completa.

    Este serializer se usa cuando React abre el detalle de un registro.
    Aquí sí se devuelven más campos porque la ficha completa se organiza por
    secciones: ubicación, fecha, condición, características físicas, señas,
    datos dentales, médicos e institucionales.
    """

    finding_type_display = serializers.CharField(
        source="get_finding_type_display",
        read_only=True,
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    confidence_level_display = serializers.CharField(
        source="get_confidence_level_display",
        read_only=True,
    )
    estimated_sex_display = serializers.CharField(
        source="get_estimated_sex_display",
        read_only=True,
    )
    created_by_username = serializers.SerializerMethodField()

    def get_created_by_username(self, obj):
        """
        Devuelve el nombre de la usuaria que creó el registro.

        Por ahora puede regresar None porque el MVP todavía permite crear registros
        sin autenticación. Mantener este campo en la respuesta ayuda a que React no
        tenga que cambiar la estructura del listado cuando agreguemos login.
        """
        if obj.created_by:
            return obj.created_by.username

        return None

    class Meta:
        model = FindingRecord
        fields = "__all__"
        read_only_fields = [
            "id",
            "record_code",
            "created_by",
            "created_at",
            "updated_at",
        ]


class FindingRecordCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y editar registros.

    Este serializer controla qué campos puede mandar React al backend.
    Campos como created_by, created_at y updated_at no se reciben desde frontend
    porque deben ser controlados por el backend.
    """

    class Meta:
        model = FindingRecord
        exclude = [
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "record_code",
        ]