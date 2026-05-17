# Contrato inicial de API - Registro Digno

Este documento describe el contrato inicial del backend para el módulo de registros de hallazgos.

El objetivo es que frontend pueda consumir la API sin adivinar rutas, nombres de campos, estructura de respuesta o valores válidos.

## 1. Base URL local

```txt
http://localhost:8000
```

## 2. Documentación automática

Swagger está disponible en:

```txt
GET /api/docs/
```

Esquema OpenAPI:

```txt
GET /api/schema/
```

## 3. Endpoints técnicos

```txt
GET /api/health/
GET /api/db/
```

`/api/health/` valida que el backend responde.

`/api/db/` valida la conexión inicial con MySQL.

## 4. Endpoints del módulo de hallazgos

```txt
GET    /api/findings/
POST   /api/findings/
GET    /api/findings/<id>/
PATCH  /api/findings/<id>/
DELETE /api/findings/<id>/
GET    /api/findings/catalogs/
```

## 5. Respuesta paginada del listado

El endpoint:

```txt
GET /api/findings/
```

devuelve una respuesta paginada.

Ejemplo:

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "record_code": "RD-00002",
      "status": "draft",
      "status_display": "Borrador",
      "finding_type": "bone_remains",
      "finding_type_display": "Restos óseos",
      "state": "Ciudad de México",
      "municipality": "Iztapalapa",
      "finding_date": "2026-05-16",
      "estimated_sex": "unknown",
      "estimated_sex_display": "Desconocido",
      "estimated_age": "Desconocido",
      "estimated_height": "Desconocido",
      "tattoos": "",
      "scars": "",
      "prosthetics": "",
      "contact_email": "contacto@ejemplo.com",
      "created_by_username": null,
      "created_at": "2026-05-16T10:20:03.491998-06:00",
      "updated_at": "2026-05-16T10:20:03.492029-06:00"
    }
  ]
}
```

Frontend debe leer los registros desde:

```js
data.results
```

No debe asumir que la respuesta es un arreglo directo.

## 6. Crear registro

Endpoint:

```txt
POST /api/findings/
```

Header:

```txt
Content-Type: application/json
```

Ejemplo de body:

```json
{
  "status": "draft",
  "finding_type": "bone_remains",
  "source": "Observación directa",
  "confidence_level": "unconfirmed",
  "country": "México",
  "state": "Ciudad de México",
  "municipality": "Iztapalapa",
  "locality": "Pendiente",
  "region": "Zona general",
  "place_type": "Predio",
  "exact_location_restricted": "Dato restringido para pruebas",
  "coordinates_restricted": "",
  "location_notes": "Ubicación general registrada para prueba del MVP",
  "finding_date": "2026-05-16",
  "approximate_time": null,
  "date_notes": "Fecha usada para prueba de creación",
  "estimated_individuals": "Indeterminado",
  "conservation_status": "Esqueletizado",
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
  "distinctive_marks_notes": "Sin señas particulares registradas en esta prueba",
  "dental_notes": "Pendiente",
  "medical_notes": "Pendiente",
  "institutional_notes": "Pendiente",
  "contact_email": "contacto@ejemplo.com"
}
```

El backend genera automáticamente:

```txt
id
record_code
created_at
updated_at
```

Frontend no debe enviar esos campos.

## 7. Ver ficha completa

Endpoint:

```txt
GET /api/findings/<id>/
```

Ejemplo:

```txt
GET /api/findings/1/
```

Este endpoint se usa para la vista de detalle.

## 8. Edición parcial

Endpoint:

```txt
PATCH /api/findings/<id>/
```

Ejemplo:

```json
{
  "status": "active"
}
```

PATCH permite actualizar solo algunos campos sin reenviar toda la ficha.

## 9. Filtros disponibles

Ejemplos:

```txt
GET /api/findings/?status=draft
GET /api/findings/?finding_type=bone_remains
GET /api/findings/?confidence_level=unconfirmed
GET /api/findings/?country=México
GET /api/findings/?state=Ciudad de México
GET /api/findings/?municipality=Iztapalapa
GET /api/findings/?estimated_sex=unknown
GET /api/findings/?finding_date_from=2026-05-01
GET /api/findings/?finding_date_to=2026-05-16
```

## 10. Búsqueda textual

Endpoint:

```txt
GET /api/findings/?search=Iztapalapa
```

La búsqueda textual considera campos como:

```txt
record_code
state
municipality
locality
region
tattoos
scars
moles
prosthetics
surgical_marks
institutional_notes
```

## 11. Ordenamiento

Ejemplos:

```txt
GET /api/findings/?ordering=finding_date
GET /api/findings/?ordering=-finding_date
GET /api/findings/?ordering=created_at
GET /api/findings/?ordering=-created_at
```

Campos ordenables:

```txt
created_at
updated_at
finding_date
state
municipality
```

## 12. Catálogos para formularios

Endpoint:

```txt
GET /api/findings/catalogs/
```

Este endpoint devuelve valores válidos para selectores.

Frontend debe usar `value` para enviar datos al backend y `label` para mostrar texto al usuario.

Ejemplo:

```json
{
  "record_status": [
    {
      "value": "draft",
      "label": "Borrador"
    },
    {
      "value": "active",
      "label": "Activo"
    }
  ],
  "finding_type": [
    {
      "value": "body",
      "label": "Cuerpo"
    },
    {
      "value": "bone_remains",
      "label": "Restos óseos"
    }
  ],
  "confidence_level": [
    {
      "value": "confirmed",
      "label": "Confirmado"
    },
    {
      "value": "probable",
      "label": "Probable"
    },
    {
      "value": "unconfirmed",
      "label": "No confirmado"
    }
  ],
  "estimated_sex": [
    {
      "value": "woman",
      "label": "Mujer"
    },
    {
      "value": "man",
      "label": "Hombre"
    },
    {
      "value": "undetermined",
      "label": "Indeterminado"
    },
    {
      "value": "unknown",
      "label": "Desconocido"
    }
  ]
}
```

## 13. Contacto por correo

Cada registro puede incluir:

```txt
contact_email
```

Frontend puede construir un enlace tipo:

```txt
mailto:contacto@ejemplo.com?subject=Consulta sobre registro RD-00001
```

El backend solo almacena el correo. El envío real del correo no se realiza desde la API en esta versión.

## 14. Campos sensibles

Estos campos existen desde el MVP, pero deben tratarse con cuidado:

```txt
exact_location_restricted
coordinates_restricted
location_notes
general_condition_notes
physical_notes
distinctive_marks_notes
dental_notes
medical_notes
institutional_notes
```

En esta primera versión todavía no hay permisos avanzados por rol. Más adelante estos campos deberán ocultarse o limitarse según permisos.

## 15. Estado actual de autenticación

Por ahora los endpoints usan acceso abierto durante desarrollo para facilitar pruebas con Postman y React.

Pendiente:

```txt
login
JWT
roles
permisos por usuaria
permisos por colectivo
restricción de campos sensibles
```

Antes de despliegue real, los endpoints de registros deben protegerse.