from unittest.mock import patch
from django.urls import reverse
from rest_framework.test import APITestCase
from requests.exceptions import Timeout
from users.models import User
class SoapTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='soap@test.local', password='SoapClave!771', matricula='SOAP01')
        self.url = reverse('soap-country')
    def test_requires_jwt(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)
    @patch('integrations.views.get_country_info')
    def test_input_validation_and_uppercase(self, lookup):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get(self.url, {'code': 'https://otro.com'}).status_code, 400)
        lookup.assert_not_called()
        lookup.return_value = {'code': 'MX', 'name': 'Mexico', 'capital': 'Mexico City', 'currency': 'MXN', 'phone_code': '52', 'languages': ['Spanish']}
        response = self.client.get(self.url, {'code': 'mx'})
        self.assertEqual(response.status_code, 200)
        lookup.assert_called_once_with('MX')
        self.assertEqual(response.data['protocol'], 'SOAP')
        self.assertNotIn('password', response.data)
    @patch('integrations.views.get_country_info', side_effect=Timeout('proveedor'))
    def test_upstream_failure_is_502(self, lookup):
        self.client.force_authenticate(self.user)
        with self.assertLogs('integrations.views', level='ERROR'):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, 502)
        self.assertNotIn('proveedor', str(response.data))
    @patch('integrations.views.get_country_info', return_value=None)
    def test_unknown_country(self, lookup):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get(self.url, {'code': 'ZZ'}).status_code, 404)
