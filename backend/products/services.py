from decimal import Decimal, ROUND_HALF_UP

from .models import Product


class EstrategiaDescuento:
    def calcular(self, precio):
        raise NotImplementedError


class DescuentoElectronica(EstrategiaDescuento):
    def calcular(self, precio):
        return precio * Decimal('0.90')


class DescuentoRopa(EstrategiaDescuento):
    def calcular(self, precio):
        return precio * Decimal('0.80')


class SinDescuento(EstrategiaDescuento):
    def calcular(self, precio):
        return precio


def obtener_estrategia(categoria_nombre):
    estrategias = {
        'Electronica': DescuentoElectronica(),
        'Ropa': DescuentoRopa(),
    }
    return estrategias.get(categoria_nombre, SinDescuento())


def calcular_precio_final(pk):
    producto = Product.objects.select_related('category').get(pk=pk)
    estrategia = obtener_estrategia(producto.category.name)
    precio_final = estrategia.calcular(producto.price).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP,
    )
    return {
        'producto': producto.name,
        'categoria': producto.category.name,
        'precio_original': str(producto.price),
        'precio_final': str(precio_final),
    }
