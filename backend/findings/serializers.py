from rest_framework import serializers

from findings.models import FindingRecord


class FrontendAliasMixin:
    """
    Mixin de compatibilidad entre frontend y backend.

    El backend conserva nombres canónicos claros para base de datos:
    - status
    - location_notes
    - conservation_status

    Pero el frontend actual ya manda:
    - record_status
    - place_notes
    - conservation_state

    Este mixin traduce esos nombres antes de validar, sin obligar todavía
    a reescribir el formulario React.
    """

    FIELD_ALIASES = {
        "record_status": "status",
        "place_notes": "location_notes",
        "conservation_state": "conservation_status",
    }

    def to_internal_value(self, data):
        """
        Traduce alias del frontend a campos reales del modelo.

        Si React manda el alias y no manda el campo canónico, copiamos el valor.
        Después eliminamos el alias para que DRF no lo marque como campo inválido.
        """

        mutable_data = data.copy()

        for frontend_field, model_field in self.FIELD_ALIASES.items():
            if frontend_field in mutable_data and model_field not in mutable_data:
                mutable_data[model_field] = mutable_data[frontend_field]

            if frontend_field in mutable_data:
                mutable_data.pop(frontend_field)

        return super().to_internal_value(mutable_data)


class FindingRecordListSerializer(serializers.ModelSerializer):
    """
    Serializer para la vista de lista.

    Este serializer devuelve solo los campos necesarios para mostrar una tabla,
    tarjetas o listado en React. No incluye todos los campos sensibles ni todos
    los campos largos porque la lista debe ser ligera y rápida de consultar.
    """

    # Alias de lectura para mantener compatibilidad con componentes que usen record_status.
    record_status = serializers.CharField(source="status", read_only=True)

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
            "record_status",
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
            "amputations",
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

    # Alias de lectura para mantener compatibilidad con el frontend actual.
    record_status = serializers.CharField(source="status", read_only=True)
    place_notes = serializers.CharField(source="location_notes", read_only=True)
    conservation_state = serializers.CharField(
        source="conservation_status",
        read_only=True,
    )

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
    created_by_name = serializers.SerializerMethodField()
    created_by_email = serializers.SerializerMethodField()

    def get_created_by_username(self, obj):
        """
        Devuelve el nombre de usuario de quien creó el registro.

        Por ahora puede regresar None porque el MVP todavía permite crear registros
        sin autenticación.
        """

        if obj.created_by:
            return obj.created_by.username

        return None

    def get_created_by_name(self, obj):
        """
        Devuelve un nombre legible de la usuaria creadora cuando exista.

        Se agrega porque la ficha de React intenta mostrar created_by_name.
        """

        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name or obj.created_by.username

        return None

    def get_created_by_email(self, obj):
        """
        Devuelve el correo de la usuaria creadora cuando exista.

        Se agrega por compatibilidad con la ficha de React. Para contacto del
        registro sigue existiendo contact_email como campo propio del hallazgo.
        """

        if obj.created_by:
            return obj.created_by.email

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


class FindingRecordCreateUpdateSerializer(
    FrontendAliasMixin,
    serializers.ModelSerializer,
):
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