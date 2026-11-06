from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from .models import User
class UserSecurityTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(email='admin@test.local', password='AdminSeguro!824', matricula='ADM001')
        self.user = User.objects.create_user(email='alumno@test.local', password='AlumnoSeguro!492', matricula='IDGS001')
        self.client.force_authenticate(self.admin)
        self.url = reverse('users-detail', args=[self.user.pk])
    def test_patch_without_password_keeps_target_hash(self):
        original = self.user.password
        result = self.client.patch(self.url, {'first_name': 'Uriel'})
        self.assertEqual(result.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.password, original)
        self.assertTrue(self.user.check_password('AlumnoSeguro!492'))
        self.assertFalse(self.user.check_password('AdminSeguro!824'))
        self.assertNotIn('password', result.data)
    def test_put_without_password_keeps_target_hash(self):
        original = self.user.password
        result = self.client.put(self.url, {'email': self.user.email, 'matricula': 'IDGS001', 'first_name': 'Cambio'})
        self.assertEqual(result.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(original, self.user.password)
    def test_explicit_password_is_hashed(self):
        result = self.client.patch(self.url, {'password': 'NuevaClave!882'})
        self.assertEqual(result.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NuevaClave!882'))
        self.assertNotIn('password', result.data)
    def test_read_endpoints_never_expose_password(self):
        for url in [reverse('users-list'), self.url, reverse('auth-me')]:
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200)
            self.assertNotIn('password', str(response.data))
            self.assertNotIn('pbkdf2_', str(response.data))
    def test_create_requires_password_and_hashes_it(self):
        payload = {'email': 'nuevo@test.local', 'matricula': 'IDGS002'}
        self.assertEqual(self.client.post(reverse('users-list'), payload).status_code, 400)
        payload['password'] = 'CuentaNueva!731'
        response = self.client.post(reverse('users-list'), payload)
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('password', response.data)
        self.assertTrue(User.objects.get(email=payload['email']).check_password(payload['password']))
    def test_permissions(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(reverse('auth-me')).status_code, 401)
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get(reverse('users-list')).status_code, 403)
        self.assertEqual(self.client.patch(self.url, {'is_staff': True}).status_code, 403)
    def test_jwt_email_login_and_lifetime(self):
        self.client.force_authenticate(None)
        response = self.client.post(reverse('token_obtain_pair'), {'email': self.user.email, 'password': 'AlumnoSeguro!492'})
        self.assertEqual(response.status_code, 200)
        token = AccessToken(response.data['access'])
        self.assertEqual(token['exp'] - token['iat'], 900)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
        me = self.client.get(reverse('auth-me'))
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data['matricula'], 'IDGS001')
        self.assertNotIn('password', me.data)
        self.assertEqual(self.client.post(reverse('token_refresh'), {'refresh': response.data['refresh']}).status_code, 200)
    def test_empty_password_is_rejected(self):
        self.assertEqual(self.client.patch(self.url, {'password': ''}).status_code, 400)
    def test_admin_can_delete(self):
        self.assertEqual(self.client.delete(self.url).status_code, 204)

class RegistrationTests(APITestCase):
    def test_public_registration_is_safe(self):
        response = self.client.post(reverse('register'), {'email': 'nuevo@test.local', 'first_name': 'Nuevo', 'last_name': 'Alumno', 'matricula': 'IDGS777', 'password': 'AlumnoNuevo!721', 'is_staff': True, 'is_superuser': True}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('password', response.data)
        user = User.objects.get(email='nuevo@test.local')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.check_password('AlumnoNuevo!721'))
        self.assertEqual(self.client.get(reverse('auth-me')).status_code, 401)
        token = self.client.post(reverse('token_obtain_pair'), {'email': user.email, 'password': 'AlumnoNuevo!721'}, format='json')
        self.assertEqual(token.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token.data['access'])
        self.assertEqual(self.client.get(reverse('auth-me')).data['first_name'], 'Nuevo')
        self.assertEqual(self.client.get(reverse('users-list')).status_code, 403)
    def test_register_rejects_weak_password_and_duplicate_email(self):
        payload = {'email': 'existente@test.local', 'matricula': 'A0001', 'password': 'NuevaClave!731'}
        self.assertEqual(self.client.post(reverse('register'), payload).status_code, 201)
        payload['email'] = 'EXISTENTE@test.local'; payload['matricula'] = 'A0002'
        self.assertEqual(self.client.post(reverse('register'), payload).status_code, 400)
        payload['email'] = 'otro@test.local'; payload['password'] = '123'
        self.assertEqual(self.client.post(reverse('register'), payload).status_code, 400)
    def test_registration_does_not_expose_user_list(self):
        self.assertEqual(self.client.get(reverse('register')).status_code, 405)
