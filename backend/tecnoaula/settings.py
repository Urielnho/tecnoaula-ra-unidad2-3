import os
from pathlib import Path
from datetime import timedelta
from django.core.management.utils import get_random_secret_key
BASE_DIR = Path(__file__).resolve().parent.parent
# Persistencia local para que los JWT sobrevivan al reinicio; nunca se versiona.
secret_file = BASE_DIR / '.local-secret'
if not os.environ.get('DJANGO_SECRET_KEY') and not secret_file.exists():
    secret_file.write_text(get_random_secret_key(), encoding='utf-8')
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or secret_file.read_text(encoding='utf-8')
DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']
INSTALLED_APPS = ['django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes', 'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles', 'rest_framework', 'drf_yasg', 'django_filters', 'corsheaders', 'integrations', 'users', 'products']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', 'django.middleware.security.SecurityMiddleware', 'django.contrib.sessions.middleware.SessionMiddleware', 'django.middleware.common.CommonMiddleware', 'django.middleware.csrf.CsrfViewMiddleware', 'django.contrib.auth.middleware.AuthenticationMiddleware', 'django.contrib.messages.middleware.MessageMiddleware', 'django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF = 'tecnoaula.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': {'context_processors': ['django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'tecnoaula.wsgi.application'
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
# Opcional: conserva soporte para MySQL de la Unidad 1 (pip install mysqlclient).
if os.environ.get('MYSQL_DATABASE'):
    DATABASES = {'default': {'ENGINE': 'django.db.backends.mysql', 'NAME': os.environ['MYSQL_DATABASE'], 'USER': os.environ.get('MYSQL_USER', 'root'), 'PASSWORD': os.environ.get('MYSQL_PASSWORD', ''), 'HOST': os.environ.get('MYSQL_HOST', 'localhost'), 'PORT': os.environ.get('MYSQL_PORT', '3306'), 'OPTIONS': {'charset': 'utf8mb4'}}}
AUTH_USER_MODEL = 'users.User'
AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}, {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'}, {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'}, {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'}]
REST_FRAMEWORK = {'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'], 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated']}
SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15), 'REFRESH_TOKEN_LIFETIME': timedelta(days=1), 'AUTH_HEADER_TYPES': ('Bearer',)}
SWAGGER_SETTINGS = {'SECURITY_DEFINITIONS': {'Bearer': {'type': 'apiKey', 'name': 'Authorization', 'in': 'header', 'description': 'Escribir: Bearer <access>'}}, 'USE_SESSION_AUTH': False}
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Phoenix'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = ['http://127.0.0.1:5173', 'http://localhost:5173']
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {'register': '20/hour', 'soap': '30/min'}
