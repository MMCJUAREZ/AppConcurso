from django.conf import settings
from django.db import models


class FindingRecord(models.Model):
    """
    Modelo principal para el registro de hallazgos.

    Esta clase representa la ficha central del sistema. Se diseñó como una
    primera versión amplia para que el frontend pueda registrar y visualizar
    hallazgos desde el MVP, pero sin cerrar el crecimiento futuro hacia
    permisos, auditoría, adjuntos, validaciones comunitarias o campos por
    secciones más especializadas.
    """

    class RecordStatus(models.TextChoices):
        """
        Estados internos del registro.

        Se usan para que backend y frontend manejen un flujo común:
        borrador, activo, en revisión, restringido, cerrado o archivado.
        """

        DRAFT = "draft", "Borrador"
        ACTIVE = "active", "Activo"
        IN_REVIEW = "in_review", "En revisión"
        RESTRICTED = "restricted", "Restringido"
        CLOSED = "closed", "Cerrado"
        ARCHIVED = "archived", "Archivado"

    class FindingType(models.TextChoices):
        """
        Tipo general de hallazgo.

        Estos valores permiten filtrar registros y evitar texto libre en un
        campo que el frontend necesitará mostrar como selector.
        """

        BODY = "body", "Cuerpo"
        BONE_REMAINS = "bone_remains", "Restos óseos"
        HUMAN_FRAGMENT = "human_fragment", "Fragmento humano"
        OTHER = "other", "Otro"
        UNKNOWN = "unknown", "Desconocido"

    class ConfidenceLevel(models.TextChoices):
        """
        Nivel de confianza del dato registrado.

        No significa identificación ni validación pericial. Solo indica el
        grado de certeza interna de la información capturada.
        """

        CONFIRMED = "confirmed", "Confirmado"
        PROBABLE = "probable", "Probable"
        UNCONFIRMED = "unconfirmed", "No confirmado"

    class EstimatedSex(models.TextChoices):
        """
        Sexo estimado observable.

        Se mantiene como campo estimado porque el sistema no debe emitir
        conclusiones forenses ni identificaciones definitivas.
        """

        WOMAN = "woman", "Mujer"
        MAN = "man", "Hombre"
        UNDETERMINED = "undetermined", "Indeterminado"
        UNKNOWN = "unknown", "Desconocido"

    # Código interno legible del registro.
    # Se genera después de guardar el registro para usar el ID de base de datos.
    record_code = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        editable=False,
    )

    # Datos internos del registro.
    status = models.CharField(
        max_length=20,
        choices=RecordStatus.choices,
        default=RecordStatus.DRAFT,
    )
    finding_type = models.CharField(
        max_length=30,
        choices=FindingType.choices,
        default=FindingType.UNKNOWN,
    )
    source = models.CharField(
        max_length=150,
        blank=True,
        help_text="Fuente general del dato: observación directa, documento, autoridad, testimonio u otra.",
    )
    confidence_level = models.CharField(
        max_length=30,
        choices=ConfidenceLevel.choices,
        default=ConfidenceLevel.UNCONFIRMED,
    )

    # Ubicación general visible para búsqueda y visualización.
    country = models.CharField(max_length=100, default="México")
    state = models.CharField(max_length=100)
    municipality = models.CharField(max_length=100, blank=True)
    locality = models.CharField(max_length=150, blank=True)
    region = models.CharField(max_length=150, blank=True)
    place_type = models.CharField(max_length=100, blank=True)

    # Campos sensibles.
    # Se separan desde el modelo para que después puedan ocultarse por permisos.
    exact_location_restricted = models.TextField(blank=True)
    coordinates_restricted = models.CharField(max_length=100, blank=True)
    location_notes = models.TextField(blank=True)

    # Fecha y tiempo.
    finding_date = models.DateField(null=True, blank=True)
    approximate_time = models.TimeField(null=True, blank=True)
    date_notes = models.TextField(blank=True)

    # Condición general del hallazgo.
    estimated_individuals = models.CharField(max_length=100, blank=True)
    conservation_status = models.CharField(max_length=100, blank=True)
    integrity = models.CharField(max_length=100, blank=True)
    exposure = models.CharField(max_length=100, blank=True)
    general_condition_notes = models.TextField(blank=True)

    # Características físicas observables.
    estimated_sex = models.CharField(
        max_length=30,
        choices=EstimatedSex.choices,
        default=EstimatedSex.UNKNOWN,
    )
    estimated_age = models.CharField(max_length=100, blank=True)
    estimated_height = models.CharField(max_length=100, blank=True)
    estimated_weight = models.CharField(max_length=100, blank=True)
    estimated_build = models.CharField(max_length=100, blank=True)
    skin_color = models.CharField(max_length=100, blank=True)
    hair = models.CharField(max_length=255, blank=True)
    facial_hair = models.CharField(max_length=255, blank=True)
    eyes = models.CharField(max_length=100, blank=True)
    physical_notes = models.TextField(blank=True)

    # Señas particulares.
    tattoos = models.TextField(blank=True)
    scars = models.TextField(blank=True)
    moles = models.TextField(blank=True)
    piercings = models.TextField(blank=True)
    prosthetics = models.TextField(blank=True)
    surgical_marks = models.TextField(blank=True)
    distinctive_marks_notes = models.TextField(blank=True)

    # Bloques que se dejan desde ahora para no rediseñar la API después.
    dental_notes = models.TextField(blank=True)
    medical_notes = models.TextField(blank=True)
    institutional_notes = models.TextField(blank=True)

    # Correo de contacto para que React pueda construir un mailto.
    contact_email = models.EmailField(blank=True)

    # Relación con la usuaria que creó el registro.
    # Por ahora permite null porque todavía no cerramos autenticación.
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="finding_records",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Registro de hallazgo"
        verbose_name_plural = "Registros de hallazgos"

    def save(self, *args, **kwargs):
        """
        Genera un código interno tipo RD-00001.

        Primero se guarda el registro para obtener el ID de base de datos.
        Después se actualiza record_code. Esto permite tener códigos legibles
        para frontend, búsquedas, contacto por correo y documentación interna.
        """

        if not self.record_code:
            super().save(*args, **kwargs)
            self.record_code = f"RD-{self.pk:05d}"
            FindingRecord.objects.filter(pk=self.pk).update(
                record_code=self.record_code
            )
            return

        super().save(*args, **kwargs)

    def __str__(self):
        code = self.record_code or "Sin código"
        return f"{code} - {self.get_finding_type_display()}"