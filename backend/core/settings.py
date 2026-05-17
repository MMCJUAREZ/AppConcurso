from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'llave-insegura-cambiar-produccion'
DEBUG = True

# Permitir conexiones desde los contenedores
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',

    'rest_framework',
    'django_filters',
    'drf_spectacular',

    'findings',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'

# Configuración de MySQL apuntando al contenedor 'db'
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'proyectoDB',
        'USER': 'admin',
        'PASSWORD': 'Admin123*',
        'HOST': 'db',
        'PORT': '3306',

        # Base usada por Django al correr pruebas automáticas.
        # Se separa de proyectoDB para no tocar los datos reales de desarrollo.
        'TEST': {
            'NAME': 'test_proyectoDB',
        },
    }
}

# Permitir que React se conecte
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://172.24.230.77:5173",
]

STATIC_URL = 'static/'

LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Mexico_City'
USE_I18N = True
USE_TZ = True

REST_FRAMEWORK = {
    # Genera el esquema OpenAPI usado por Swagger.
    # Esto permite documentar la API para frontend y para pruebas de integración.
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',

    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Registro Digno API',
    'DESCRIPTION': (
        'API backend para registro, visualización y búsqueda de hallazgos. '
        'El MVP prioriza registros de hallazgos, filtros básicos, ficha completa '
        'y catálogos para formularios de React.'
    ),
    'VERSION': '0.1.0',
}
