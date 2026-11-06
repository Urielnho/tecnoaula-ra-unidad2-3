from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Category, Product


class ApiCrudTests(APITestCase):
    def setUp(self):
        user = get_user_model().objects.create_superuser(email='crud@test.local', password='CrudClave!792', matricula='CRUD01')
        self.client.force_authenticate(user=user)
        self.category = Category.objects.create(name='Electronica')
        self.product = Product.objects.create(
            name='Laptop', category=self.category,
            description='Laptop HP', price=Decimal('15000.00'),
        )

    def test_create_category(self):
        response = self.client.post('/api/v1/categories/', {'name': 'Ropa'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Category.objects.count(), 2)
        self.assertEqual(Category.objects.get(pk=response.data['id']).name, 'Ropa')

    def test_list_categories(self):
        response = self.client.get('/api/v1/categories/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [
            {'id': self.category.pk, 'name': 'Electronica'},
        ])

    def test_create_product(self):
        response = self.client.post('/api/v1/products/', {
            'name': 'Mouse', 'category_id': self.category.pk,
            'description': 'Mouse inalambrico', 'price': '500.00',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Product.objects.count(), 2)
        created = Product.objects.get(pk=response.data['id'])
        self.assertEqual(created.name, 'Mouse')
        self.assertEqual(created.category_id, self.category.pk)
        self.assertEqual(created.price, Decimal('500.00'))

    def test_list_products(self):
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.product.pk)
        self.assertEqual(response.data[0]['name'], 'Laptop')
        self.assertEqual(response.data[0]['category'], 'Electronica')

    def test_update_product(self):
        response = self.client.put(f'/api/v1/products/{self.product.pk}/', {
            'name': 'Laptop Pro', 'category_id': self.category.pk,
            'description': 'Laptop HP actualizada', 'price': '18000.00',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Laptop Pro')
        self.assertEqual(self.product.description, 'Laptop HP actualizada')
        self.assertEqual(self.product.price, Decimal('18000.00'))
        self.assertEqual(self.product.category_id, self.category.pk)
        self.assertEqual(Product.objects.count(), 1)

    def test_delete_product(self):
        response = self.client.delete(f'/api/v1/products/{self.product.pk}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())
        self.assertEqual(Product.objects.count(), 0)
        self.assertTrue(Category.objects.filter(pk=self.category.pk).exists())


class PrecioFinalTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(email='precio@test.local', password='PrecioClave!792', matricula='PRE01')
        self.product = Product.objects.create(
            name='Laptop', category=Category.objects.create(name='Electronica'),
            description='Laptop HP', price=Decimal('15000.00'),
        )
        self.ropa = Product.objects.create(
            name='Camisa', category=Category.objects.create(name='Ropa'),
            description='Camisa de algodon', price=Decimal('500.00'),
        )

    def test_precio_final_autenticado(self):
        token = RefreshToken.for_user(self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        for producto, esperado in [(self.product, '13500.00'), (self.ropa, '400.00')]:
            with self.subTest(categoria=producto.category.name):
                response = self.client.get(
                    f'/api/v1/products/{producto.pk}/precio-final/',
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data['precio_final'], esperado)
                self.assertEqual(response.data['categoria'], producto.category.name)

    def test_precio_final_sin_autenticar(self):
        self.client.credentials()
        response = self.client.get(
            f'/api/v1/products/{self.product.pk}/precio-final/',
        )
        self.assertEqual(response.status_code, 401)
