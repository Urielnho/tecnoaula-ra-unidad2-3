from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ProductViewSet, precio_final

app_name = 'products'

router = DefaultRouter()
router.register('products', ProductViewSet, basename='products')
router.register('categories', CategoryViewSet, basename='categories')

urlpatterns = [
    path('products/<int:pk>/precio-final/', precio_final, name='precio-final'),
    path('', include(router.urls)),
]
