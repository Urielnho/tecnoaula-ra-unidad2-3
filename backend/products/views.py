from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from .services import calcular_precio_final


class CategoryViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        return [IsAuthenticated()] if self.request.method in ('GET', 'HEAD', 'OPTIONS') else [IsAdminUser()]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        return [IsAuthenticated()] if self.request.method in ('GET', 'HEAD', 'OPTIONS') else [IsAdminUser()]
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']


# Facade: una llamada coordina la consulta y el descuento del producto.


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def precio_final(request, pk):
    try:
        resultado = calcular_precio_final(pk)
    except Product.DoesNotExist:
        raise NotFound('Producto no encontrado.')
    return Response(resultado)
