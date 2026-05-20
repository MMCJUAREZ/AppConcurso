# Registro Digno

Aplicación web privada para el registro, consulta y visualización estructurada de hallazgos, desarrollada como parte del **Concurso de Desarrollo de Aplicaciones SIE 2026: Talento Universitario**.

El proyecto busca ofrecer una herramienta de apoyo para madres buscadoras e integrantes autorizadas, permitiendo documentar información sensible de forma ordenada, consultable y respetuosa.

> **Nota importante:** esta versión corresponde a una demo funcional local. La aplicación ya permite registrar, consultar, filtrar y visualizar hallazgos, además de mostrar un flujo demo de invitaciones. Sin embargo, todavía no debe considerarse una versión productiva ni usarse con datos reales.

---

## Integrantes

- Cristian Jesus Silva Contreras
- Prashanti Peña Guevara
- Ulises Juárez Guzmán

---

## Institución

Universidad Autónoma Metropolitana

---

## Evento

Concurso de Desarrollo de Aplicaciones SIE 2026: Talento Universitario

---

## Repositorio

Repositorio del proyecto:

```text
git@github.com:MMCJUAREZ/AppConcurso.git
````

---

## Descripción general

**Registro Digno** es una aplicación web privada orientada al registro de hallazgos mediante fichas organizadas por bloques de información.

La aplicación permite capturar datos generales, ubicación, fecha, condición del hallazgo, características físicas observables, señas particulares, información dental, información médica, información institucional y correo de contacto.

El sistema no identifica cuerpos, no confirma identidades y no sustituye procedimientos oficiales, periciales, ministeriales o de búsqueda. Su propósito es apoyar la documentación comunitaria interna mediante una herramienta digital estructurada.

Dado que el tema tratado es sensible, durante el desarrollo cuidamos que el lenguaje de la interfaz y de los datos de prueba fuera sobrio, respetuoso y no revictimizante.

---

## Estado actual del proyecto

Actualmente contamos con una demo funcional local que incluye:

* Frontend en React con Vite.
* Backend en Django y Django REST Framework.
* Base de datos MySQL.
* Entorno local con Docker Compose.
* Registro de hallazgos.
* Lista de registros.
* Filtros rápidos por estado.
* Búsqueda textual básica.
* Vista de ficha completa.
* Formulario por bloques.
* Login demo.
* Cierre de sesión.
* Invitaciones demo en frontend.
* Registros ficticios para presentación.
* Documentación automática de API con Swagger.
* Pruebas iniciales del módulo principal del backend.

La seguridad real, los permisos por rol, las invitaciones persistidas en backend, el envío real de correos, la bitácora de acciones y el despliegue productivo quedan pendientes para una etapa posterior.

---

## Tecnologías utilizadas

| Capa                  | Tecnología                |
| --------------------- | ------------------------- |
| Frontend              | React                     |
| Empaquetador frontend | Vite                      |
| Cliente HTTP          | Axios                     |
| Backend               | Django                    |
| API                   | Django REST Framework     |
| Filtros API           | django-filter             |
| Documentación API     | drf-spectacular / Swagger |
| Base de datos         | MySQL                     |
| Contenedores          | Docker                    |
| Orquestación local    | Docker Compose            |

---

## Arquitectura general

El proyecto está organizado como un monorepo:

```text
AppConcurso/
├── docker-compose.yml
├── database/
│   └── 001init.sql
├── docs/
│   └── API_CONTRACT.md
├── backend/
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/
│   └── findings/
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    └── src/
```

Flujo general:

```text
Usuaria
  ↓
Frontend React / Vite
  ↓
API REST con Axios
  ↓
Backend Django REST Framework
  ↓
Base de datos MySQL
```

---

## Servicios principales

| Servicio | Tecnología   | Puerto                    |
| -------- | ------------ | ------------------------- |
| frontend | React / Vite | 5173                      |
| backend  | Django       | 8000                      |
| db       | MySQL        | 3307 local / 3306 interno |

URLs locales principales:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8000

Swagger / documentación API:
http://localhost:8000/api/docs/

Schema OpenAPI:
http://localhost:8000/api/schema/
```

---

## Requisitos previos

Para levantar el proyecto se necesita tener instalado:

* Docker
* Docker Compose
* Git

No es necesario instalar manualmente Python, Node.js o MySQL si se ejecuta mediante Docker Compose.

---

## Clonar el repositorio

```bash
git clone git@github.com:MMCJUAREZ/AppConcurso.git
cd AppConcurso
```

---

## Levantar el proyecto completo

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Después de levantar los servicios, abrir:

```text
http://localhost:5173
```

---

## Levantar solo la base de datos

```bash
docker compose up -d db
```

---

## Aplicar migraciones del backend

```bash
docker compose run --rm backend python manage.py migrate
```

---

## Cargar datos demo

Para cargar registros ficticios de presentación y usuario demo:

```bash
docker compose run --rm backend python manage.py seed_demo_data --reset
```

Este comando carga registros de ejemplo con distintos estados:

* Activo
* Borrador
* En revisión
* Restringido
* Cerrado
* Archivado

Todos los registros son ficticios y fueron redactados con lenguaje neutral y respetuoso.

---

## Usuario demo

La demo cuenta con una usuaria de prueba para ingresar al sistema:

```text
Correo:
admin@registrodigno.local

Contraseña:
Demo12345
```

Esta cuenta representa a una usuaria aprobada con permiso para crear invitaciones dentro de la demo.

> Este acceso es solo una simulación local. Todavía no representa autenticación real contra backend.

---

## Ejecutar pruebas del backend

```bash
docker compose run --rm backend python manage.py test findings
```

Las pruebas actuales validan:

* Listado de registros.
* Creación de registros.
* Consulta de ficha individual.
* Edición parcial.
* Filtros por estado y municipio.
* Búsqueda textual.
* Endpoint de catálogos.
* Compatibilidad entre campos enviados por frontend y campos esperados por backend.

---

## Compilar frontend

```bash
docker compose run --rm frontend npm run build
```

Este comando permite verificar que el frontend compile correctamente antes de una presentación o entrega.

---

## Ver contenedores activos

```bash
docker compose ps
```

---

## Detener servicios

```bash
docker compose down
```

Si se desea eliminar también los volúmenes de base de datos:

```bash
docker compose down -v
```

> Usar `docker compose down -v` elimina los datos almacenados localmente en MySQL.

---

## Endpoints principales del backend

| Método | Endpoint                  | Descripción                         |
| ------ | ------------------------- | ----------------------------------- |
| GET    | `/api/health/`            | Verifica que el backend responde    |
| GET    | `/api/db/`                | Verifica conexión con base de datos |
| GET    | `/api/findings/`          | Lista registros de hallazgos        |
| POST   | `/api/findings/`          | Crea un nuevo registro              |
| GET    | `/api/findings/<id>/`     | Consulta una ficha completa         |
| PATCH  | `/api/findings/<id>/`     | Edita parcialmente un registro      |
| DELETE | `/api/findings/<id>/`     | Elimina un registro                 |
| GET    | `/api/findings/catalogs/` | Devuelve catálogos para formularios |
| GET    | `/api/docs/`              | Documentación Swagger               |
| GET    | `/api/schema/`            | Esquema OpenAPI                     |

---

## Funcionalidades actuales

### Login demo

La aplicación cuenta con una pantalla de inicio de sesión. En esta etapa, el login funciona como simulación local mediante frontend y `localStorage`.

Permite mostrar cómo se vería el ingreso de una usuaria aprobada, sin implementar todavía autenticación real en backend.

---

### Lista de hallazgos

La vista principal muestra los registros en una tabla con:

* ID del registro.
* Ubicación general.
* Fecha.
* Tipo de hallazgo.
* Sexo estimado.
* Edad estimada.
* Señas destacadas.
* Estado del registro.
* Acceso a ficha completa.

También incluye filtros rápidos por estado:

* Todos
* Activos
* Borradores
* En revisión
* Restringidos
* Cerrados
* Archivados

---

### Registro de hallazgos

El formulario de registro está organizado por bloques:

1. Datos internos del registro.
2. Ubicación del hallazgo.
3. Fecha y tiempo.
4. Condición general del hallazgo.
5. Características físicas observables.
6. Señas particulares.
7. Información dental.
8. Información médica.
9. Información institucional.

El formulario permite guardar información incompleta, ya que no todos los datos están disponibles desde el primer momento.

---

### Ficha completa

Cada registro puede visualizarse en una ficha completa organizada por secciones. Esto facilita revisar información extensa sin saturar la pantalla.

Los campos vacíos se muestran de forma discreta para que las fichas incompletas sigan siendo legibles.

---

### Búsqueda básica

La aplicación permite búsqueda textual y filtros rápidos. La búsqueda avanzada queda pendiente para una etapa posterior.

---

### Contacto por correo

Cada registro puede incluir un correo de contacto. En la demo, este campo permite preparar el flujo de comunicación con la persona responsable del registro.

---

### Invitaciones demo

La aplicación incluye una pantalla de invitaciones en modo demo.

Actualmente permite:

* Ver invitaciones precargadas.
* Crear una nueva invitación ficticia.
* Cambiar estado de invitación.
* Ver una vista previa del correo de invitación.
* Mostrar una usuaria demo con permiso para invitar.

Las invitaciones se guardan localmente en `localStorage`.

No se envían correos reales y todavía no se crean usuarios reales en backend.

---

## Estados del registro

| Valor interno | Etiqueta visible |
| ------------- | ---------------- |
| `draft`       | Borrador         |
| `active`      | Activo           |
| `in_review`   | En revisión      |
| `restricted`  | Restringido      |
| `closed`      | Cerrado          |
| `archived`    | Archivado        |

---

## Estados de invitación demo

| Valor interno | Etiqueta visible |
| ------------- | ---------------- |
| `pending`     | Pendiente        |
| `accepted`    | Aceptada         |
| `rejected`    | Rechazada        |
| `suspended`   | Suspendida       |
| `expired`     | Expirada         |

---

## Estructura del frontend

```text
frontend/src/
├── api/
│   ├── client.js
│   └── axios.js
├── components/
│   └── LogoutButton.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── FindingsListPage.jsx
│   ├── FindingDetailPage.jsx
│   ├── FindingFormPage.jsx
│   └── InvitationsPage.jsx
├── services/
│   ├── findingService.js
│   └── invitationDemoService.js
├── App.jsx
└── main.jsx
```

---

## Estructura del backend

```text
backend/
├── core/
│   ├── settings.py
│   ├── urls.py
│   ├── views.py
│   └── wsgi.py
├── findings/
│   ├── migrations/
│   ├── management/
│   │   └── commands/
│   │       └── seed_demo_data.py
│   ├── admin.py
│   ├── apps.py
│   ├── filters.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── manage.py
└── requirements.txt
```

---

## Módulo `findings`

El módulo `findings` concentra la lógica principal del backend.

Incluye:

* Modelo `FindingRecord`.
* Serializers para lista, detalle y creación/edición.
* Filtros de búsqueda.
* ViewSet REST.
* Endpoint de catálogos.
* Pruebas automáticas.
* Comando para cargar datos demo.

---

## Catálogos del backend

El endpoint:

```text
GET /api/findings/catalogs/
```

devuelve catálogos usados por el formulario del frontend:

* Estados del registro.
* Tipos de hallazgo.
* Niveles de confianza.
* Sexo estimado.

Esto evita que el frontend dependa de valores escritos manualmente y ayuda a mantener consistencia entre ambas capas.

---

## Consideraciones de seguridad

La seguridad real todavía no está implementada en esta demo. Actualmente contamos con una simulación de acceso en frontend para fines de presentación.

Pendientes principales:

* Autenticación real contra backend.
* Manejo seguro de sesiones o tokens.
* Roles y permisos reales.
* Invitaciones persistidas en base de datos.
* Envío real de correos.
* Protección de campos sensibles por rol.
* Bitácora de acciones.
* HTTPS para producción.
* Manejo seguro de variables de entorno.
* Backups periódicos de base de datos.

---

## Consideraciones éticas

El proyecto trabaja con información sensible. Por eso decidimos mantener un enfoque de lenguaje respetuoso, sobrio y no gráfico.

Durante el desarrollo evitamos:

* Descripciones innecesariamente explícitas.
* Lenguaje revictimizante.
* Uso de nombres reales en datos demo.
* Coordenadas reales útiles.
* Información que pudiera confundirse con casos reales.

Los datos cargados para presentación son ficticios.

---

## Próximos pasos

Para avanzar hacia una versión más completa, proponemos:

1. Implementar autenticación real en backend.
2. Agregar manejo de tokens o sesiones seguras.
3. Persistir invitaciones en MySQL.
4. Enviar correos reales de invitación.
5. Implementar roles y permisos.
6. Proteger campos sensibles según rol.
7. Agregar bitácora de acciones.
8. Implementar búsqueda avanzada.
9. Agregar adjuntos privados.
10. Preparar despliegue seguro.
11. Configurar variables de entorno para producción.
12. Configurar backups y monitoreo.

---

## Comandos rápidos

```bash
# Levantar todo
docker compose up --build

# Levantar solo base de datos
docker compose up -d db

# Aplicar migraciones
docker compose run --rm backend python manage.py migrate

# Cargar datos demo
docker compose run --rm backend python manage.py seed_demo_data --reset

# Ejecutar pruebas backend
docker compose run --rm backend python manage.py test findings

# Compilar frontend
docker compose run --rm frontend npm run build

# Ver contenedores
docker compose ps

# Detener servicios
docker compose down
```

---

