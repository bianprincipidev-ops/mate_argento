from django.db import models
from django.utils.text import slugify

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True)

    def __str__(self):
        return self.nombre
    
class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True, null=True)
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    precio_minorista = models.DecimalField(max_digits=10, decimal_places=2)
    precio_mayorista = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    imagen_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL de la imagen")
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    disponible = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre