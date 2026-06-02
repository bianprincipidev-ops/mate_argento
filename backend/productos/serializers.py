from rest_framework import serializers
from .models import Producto, Categoria

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'slug', 'descripcion',
            'precio_minorista', 'precio_mayorista', 
            'stock', 'imagen_url', 'categoria',
            'categoria_nombre', 'disponible', 'fecha_creacion'
        ]