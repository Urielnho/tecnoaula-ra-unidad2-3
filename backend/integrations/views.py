import logging
from django.utils import timezone
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from requests.exceptions import RequestException
from zeep.exceptions import Error as ZeepError
from lxml.etree import XMLSyntaxError
from .services import get_country_info, COUNTRY_WSDL
logger = logging.getLogger(__name__)
class CountryQuerySerializer(serializers.Serializer):
    code = serializers.RegexField(regex=r'^[A-Za-z]{2}$', default='MX')
class CountryResponseSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()
    capital = serializers.CharField()
    currency = serializers.CharField()
    phone_code = serializers.CharField()
    languages = serializers.ListField(child=serializers.CharField())
    provider = serializers.CharField()
    protocol = serializers.CharField()
    operation = serializers.CharField()
    wsdl = serializers.URLField()
    fetched_at = serializers.DateTimeField()
class CountryInfoView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'soap'
    @swagger_auto_schema(query_serializer=CountryQuerySerializer, responses={200: CountryResponseSerializer, 400: 'Codigo invalido', 404: 'Pais no encontrado', 502: 'SOAP no disponible'}, operation_description='Django consume FullCountryInfo del servicio SOAP publico CountryInfoService usando zeep. Requiere JWT.')
    def get(self, request):
        query = CountryQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        code = query.validated_data['code'].upper()
        try:
            result = get_country_info(code)
        except (RequestException, ZeepError, XMLSyntaxError, OSError, ValueError):
            logger.exception('No se pudo consultar CountryInfoService')
            return Response({'detail': 'El servicio SOAP no esta disponible. Intenta nuevamente.'}, status=502)
        if result is None:
            return Response({'detail': 'Pais no encontrado.'}, status=404)
        return Response({**result, 'provider': 'CountryInfoService', 'protocol': 'SOAP', 'operation': 'FullCountryInfo', 'wsdl': COUNTRY_WSDL, 'fetched_at': timezone.now().isoformat()})
