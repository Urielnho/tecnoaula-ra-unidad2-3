from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
schema_view = get_schema_view(openapi.Info(title='TecnoAula API - Tecnologia para estudiantes', default_version='v1', description='Resultado de Aprendizaje U2 y U3. Registro, usuarios, productos, JWT y consumo SOAP con zeep. Access: 15 minutos. En Authorize escribir Bearer seguido del token.'), public=True, permission_classes=[AllowAny], authentication_classes=[])
urlpatterns = [path('', lambda request: redirect('schema-swagger-ui')), path('admin/', admin.site.urls), path('api/v1/', include('users.urls')), path('api/v1/', include('integrations.urls')), path('api/v1/', include('products.urls')), re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'), path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'), path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc')]
admin.site.site_header = 'TecnoAula - Administracion'
admin.site.site_title = 'TecnoAula'
