from rest_framework import status
from rest_framework.test import APITestCase

from findings.models import FindingRecord


class FindingRecordApiTests(APITestCase):
    """
    Pruebas mínimas del módulo principal de registros.

    Estas pruebas cubren el flujo central del MVP: crear registros, listarlos,
    ver detalle, editarlos, filtrarlos y consultar catálogos para formularios
    de React.
    """

    def setUp(self):
        """
        Crea un registro base para reutilizarlo en las pruebas.

        Usamos datos similares a los que enviaría React desde el formulario.
        """

        self.record = FindingRecord.objects.create(
            status=FindingRecord.RecordStatus.DRAFT,
            finding_type=FindingRecord.FindingType.BONE_REMAINS,
            source="Observación directa",
            confidence_level=FindingRecord.ConfidenceLevel.UNCONFIRMED,
            internal_notes="Registro base de prueba",
            country="México",
            state="Ciudad de México",
            municipality="Iztapalapa",
            locality="Pendiente",
            region="Zona general",
            place_type="Predio",
            location_notes="Ubicación general de prueba",
            finding_date="2026-05-16",
            temporal_range="Fecha aproximada",
            estimated_individuals="Indeterminado",
            conservation_status="Esqueletizado",
            integrity="Parcial",
            exposure="Superficial",
            estimated_sex=FindingRecord.EstimatedSex.UNKNOWN,
            estimated_age="Desconocido",
            estimated_height="Desconocido",
            tattoos="",
            scars="",
            prosthetics="",
            amputations="",
            braces="",
            dental_prosthetics="",
            missing_teeth="",
            dental_restorations="",
            notified_authority="",
            institutional_folio="",
            case_reference="",
            semefo="",
            contact_email="contacto@ejemplo.com",
        )

        # Payload con nombres como los manda actualmente React.
        # Esto protege la compatibilidad del formulario real.
        self.create_payload = {
            "record_status": "draft",
            "finding_type": "bone_remains",
            "source": "Observación directa",
            "confidence_level": "unconfirmed",
            "internal_notes": "Nota interna de prueba",
            "country": "México",
            "state": "Ciudad de México",
            "municipality": "Tlalpan",
            "locality": "Pendiente",
            "region": "Zona general",
            "place_type": "Predio",
            "exact_location_restricted": "Dato restringido para prueba",
            "coordinates_restricted": "",
            "place_notes": "Ubicación general de prueba",
            "finding_date": "2026-05-16",
            "approximate_time": None,
            "date_notes": "Fecha usada en prueba automática",
            "temporal_range": "Durante la mañana",
            "estimated_individuals": "Indeterminado",
            "conservation_state": "Esqueletizado",
            "integrity": "Parcial",
            "exposure": "Superficial",
            "general_condition_notes": "Descripción general no gráfica",
            "estimated_sex": "unknown",
            "estimated_age": "Desconocido",
            "estimated_height": "Desconocido",
            "estimated_weight": "Desconocido",
            "estimated_build": "Indeterminada",
            "skin_color": "",
            "hair": "",
            "facial_hair": "",
            "eyes": "",
            "physical_notes": "Pendiente de confirmar",
            "tattoos": "",
            "scars": "",
            "moles": "",
            "piercings": "",
            "prosthetics": "",
            "surgical_marks": "",
            "amputations": "",
            "distinctive_marks_notes": "Sin señas particulares registradas",
            "braces": "",
            "dental_prosthetics": "",
            "missing_teeth": "",
            "dental_restorations": "",
            "dental_notes": "Pendiente",
            "medical_notes": "Pendiente",
            "notified_authority": "Pendiente",
            "institutional_folio": "FOLIO-PRUEBA",
            "case_reference": "CASO-PRUEBA",
            "semefo": "Pendiente",
            "institutional_notes": "Pendiente",
            "contact_email": "contacto@ejemplo.com",
        }

    def test_list_findings_returns_paginated_response(self):
        """
        Verifica que la lista use paginación.

        React debe leer los registros desde response.results.
        """

        response = self.client.get("/api/findings/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["count"], 1)

    def test_create_finding_record_with_frontend_aliases(self):
        """
        Verifica que la API permita crear registros usando los nombres actuales
        del formulario React.
        """

        response = self.client.post(
            "/api/findings/",
            self.create_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FindingRecord.objects.count(), 2)
        self.assertTrue(response.data["record_code"].startswith("RD-"))

        created = FindingRecord.objects.latest("id")
        self.assertEqual(created.status, "draft")
        self.assertEqual(created.location_notes, "Ubicación general de prueba")
        self.assertEqual(created.conservation_status, "Esqueletizado")
        self.assertEqual(created.internal_notes, "Nota interna de prueba")
        self.assertEqual(created.institutional_folio, "FOLIO-PRUEBA")

    def test_retrieve_finding_record_detail(self):
        """
        Verifica que la API devuelva la ficha individual.

        Este endpoint será usado por React para mostrar la vista de detalle.
        """

        response = self.client.get(f"/api/findings/{self.record.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.record.id)
        self.assertEqual(response.data["record_code"], self.record.record_code)

        # Alias de lectura para compatibilidad con React.
        self.assertEqual(response.data["record_status"], self.record.status)
        self.assertEqual(response.data["place_notes"], self.record.location_notes)
        self.assertEqual(
            response.data["conservation_state"],
            self.record.conservation_status,
        )

    def test_patch_finding_record(self):
        """
        Verifica edición parcial de registros.

        PATCH permite que React actualice solo algunos campos sin reenviar toda
        la ficha completa.
        """

        response = self.client.patch(
            f"/api/findings/{self.record.id}/",
            {"record_status": "active"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.record.refresh_from_db()
        self.assertEqual(self.record.status, FindingRecord.RecordStatus.ACTIVE)

    def test_filter_findings_by_municipality(self):
        """
        Verifica filtros básicos de búsqueda.

        Este comportamiento será usado por React para búsqueda por ubicación.
        """

        response = self.client.get("/api/findings/?municipality=Iztapalapa")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["municipality"], "Iztapalapa")

    def test_filter_findings_by_record_status_alias(self):
        """
        Verifica que el filtro record_status funcione.

        El frontend actual usa record_status en la lista, por eso backend debe
        aceptar este alias aunque el modelo use status.
        """

        response = self.client.get("/api/findings/?record_status=draft")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_search_findings(self):
        """
        Verifica búsqueda textual general.

        React podrá usar este filtro para búsquedas simples por texto.
        """

        response = self.client.get("/api/findings/?search=Iztapalapa")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_catalogs_endpoint(self):
        """
        Verifica que existan catálogos para selectores de React.

        Esto reduce errores en frontend porque los valores válidos vienen desde
        backend y no se escriben manualmente en componentes.
        """

        response = self.client.get("/api/findings/catalogs/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("record_status", response.data)
        self.assertIn("finding_type", response.data)
        self.assertIn("confidence_level", response.data)
        self.assertIn("estimated_sex", response.data)

        finding_type_values = [
            item["value"]
            for item in response.data["finding_type"]
        ]

        self.assertIn("bone_remains", finding_type_values)