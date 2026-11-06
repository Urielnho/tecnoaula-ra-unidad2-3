from functools import lru_cache
from zeep import Client, Settings
from zeep.transports import Transport
from zeep.cache import InMemoryCache
from zeep.helpers import serialize_object
from requests import Session

# El proveedor publica este servicio de demostracion sobre HTTP.
# Solo se envia un codigo de pais publico, nunca JWT ni datos del usuario.
COUNTRY_WSDL = 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL'

@lru_cache(maxsize=1)
def get_country_client():
    session = Session()
    transport = Transport(session=session, cache=InMemoryCache(timeout=3600), timeout=10, operation_timeout=15)
    return Client(COUNTRY_WSDL, transport=transport, settings=Settings(strict=True, forbid_dtd=True, forbid_entities=True, forbid_external=True))

def get_country_info(code):
    data = serialize_object(get_country_client().service.FullCountryInfo(sCountryISOCode=code))
    if not data or not data.get('sISOCode'):
        return None
    languages = (data.get('Languages') or {}).get('tLanguage', [])
    return {'code': data['sISOCode'], 'name': data['sName'], 'capital': data['sCapitalCity'], 'currency': data['sCurrencyISOCode'], 'phone_code': data['sPhoneCode'], 'languages': [item['sName'] for item in languages]}
