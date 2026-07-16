const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir los archivos estáticos que están en la misma carpeta public_html
app.use(express.static(__dirname));

// Helper para encontrar la base de datos de manera flexible en local y producción
const getDBPath = () => {
    const localPath = path.join(__dirname, 'datos_tienda.json');
    if (fs.existsSync(localPath)) return localPath;
    return path.join(__dirname, 'backend', 'datos_tienda.json');
};

const readDB = () => {
    const dbPath = getDBPath();
    if (!fs.existsSync(dbPath)) {
        return []; // Retorna un array vacío si el archivo JSON aún no se creó
    }
    const fileData = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(fileData);
};

const writeDB = (data) => {
    const dbPath = getDBPath();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

// --- ENDPOINTS ---

// 1. Obtener Categorías
app.get('/api/categorias', (req, res) => {
    try {
        const db = readDB();
        const categorias = db
            .filter(item => item.model === "productos.categoria")
            .map(item => ({
                id: item.pk,
                nombre: item.fields.nombre,
                slug: item.fields.slug
            }));
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: "Error al leer las categorías", detalle: error.message });
    }
});

// 2. Obtener Productos
app.get('/api/productos', (req, res) => {
    try {
        const db = readDB();
        const categorias = db.filter(item => item.model === "productos.categoria");
        
        const productos = db
            .filter(item => item.model === "productos.producto")
            .map(item => {
                const categoriaObj = categorias.find(cat => cat.pk === item.fields.categoria);
                return {
                    id: item.pk,
                    nombre: item.fields.nombre,
                    descripcion: item.fields.descripcion,
                    precio_minorista: item.fields.precio_minorista,
                    precio_mayorista: item.fields.precio_mayorista,
                    stock: item.fields.stock || 0,
                    imagen_url: item.fields.imagen_url || "",
                    categoria: item.fields.categoria,
                    categoria_nombre: categoriaObj ? categoriaObj.fields.nombre : "Sin categoría"
                };
            });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al leer los productos", detalle: error.message });
    }
});

// 3. Crear Producto (POST)
app.post('/api/productos', (req, res) => {
    try {
        const db = readDB();
        const nuevoId = db.length > 0 ? Math.max(...db.map(item => item.pk)) + 1 : 1;
        
        const nuevoProducto = {
            model: "productos.producto",
            pk: nuevoId,
            fields: {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                precio_minorista: parseFloat(req.body.precio_minorista),
                precio_mayorista: parseFloat(req.body.precio_mayorista),
                stock: parseInt(req.body.stock, 10) || 0,
                imagen_url: req.body.imagen_url || "",
                categoria: parseInt(req.body.categoria, 10)
            }
        };

        db.push(nuevoProducto);
        writeDB(db);
        res.status(201).json({ id: nuevoId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar el producto", detalle: error.message });
    }
});

// 4. Editar Producto (PUT)
app.put('/api/productos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const db = readDB();
        const index = db.findIndex(item => item.model === "productos.producto" && item.pk === id);

        if (index === -1) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        db[index].fields = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio_minorista: parseFloat(req.body.precio_minorista),
            precio_mayorista: parseFloat(req.body.precio_mayorista),
            stock: parseInt(req.body.stock, 10) || 0,
            imagen_url: req.body.imagen_url || "",
            categoria: parseInt(req.body.categoria, 10)
        };

        writeDB(db);
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto", detalle: error.message });
    }
});

// 5. Eliminar Producto (DELETE)
app.delete('/api/productos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        let db = readDB();
        const inicialLength = db.length;
        
        db = db.filter(item => !(item.model === "productos.producto" && item.pk === id));

        if (db.length === inicialLength) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        writeDB(db);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto", detalle: error.message });
    }
});

// --- RUTA FRONTEND ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de Mate Argento corriendo en el puerto ${PORT}`);
});