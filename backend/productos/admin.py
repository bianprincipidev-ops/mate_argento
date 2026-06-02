from django.contrib import admin
from .models import Categoria, Producto

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'slug')
    prepopulated_fields = {'slug': ('nombre',)}

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    # 1. Los campos que se van a ver como columnas en la tabla
    list_display = ('id', 'nombre', 'categoria', 'precio_minorista', 'precio_mayorista', 'stock', 'disponible')
    
    # 2. Los campos que vas a poder editar haciendo un solo clic desde la lista (tienen que estar arriba en list_display!)
    list_editable = ('precio_minorista', 'precio_mayorista', 'stock', 'disponible') 
    
    # 3. Filtros laterales y buscador
    list_filter = ('disponible', 'categoria', 'fecha_creacion')
    search_fields = ('nombre', 'descripcion')