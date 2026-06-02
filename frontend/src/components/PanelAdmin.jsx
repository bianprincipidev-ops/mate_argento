import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, PackagePlus, RefreshCw } from 'lucide-react'

// 🟢 AQUÍ: Ya agregué { alCambiarDeVista } entre las llaves para que reciba la función de App.jsx
function PanelAdmin({ alCambiarDeVista }) {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  // Estado para controlar el formulario (si es null está cerrado, si tiene datos está abierto)
  const [formulario, setFormulario] = useState(null)

  const URL_API = 'http://127.0.0.1:8000/api/productos/'
  const URL_CAT = 'http://127.0.0.1:8000/api/categorias/'

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      fetch(URL_API).then(res => res.json()),
      fetch(URL_CAT).then(res => res.json()).catch(() => [])
    ])
      .then(([dataProd, dataCat]) => {
        setProductos(dataProd)
        setCategorias(dataCat)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Inicializa el formulario en blanco para crear
  const iniciarCreacion = () => {
    setFormulario({
      nombre: '',
      descripcion: '',
      precio_minorista: '',
      precio_mayorista: '',
      stock: 0,
      categoria: categorias[0]?.id || '',
      imagen_url: ''
    })
  }

  // Carga los datos del producto elegido para editar
  const iniciarEdicion = (producto) => {
    const categoriaId = producto.categoria && typeof producto.categoria === 'object' 
      ? producto.categoria.id 
      : producto.categoria;

    setFormulario({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_minorista: producto.precio_minorista,
      precio_mayorista: producto.precio_mayorista,
      stock: producto.stock,
      categoria: categoriaId || '',
      imagen_url: producto.imagen_url || ''
    })
  }

  // Maneja el envío del formulario (POST o PUT según corresponda)
  const guardarProducto = (e) => {
    e.preventDefault()
    setGuardando(true)

    const esEdicion = Boolean(formulario.id)
    const urlEndpoint = esEdicion ? `${URL_API}${formulario.id}/` : URL_API
    const metodo = esEdicion ? 'PUT' : 'POST'

    fetch(urlEndpoint, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formulario)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar en el servidor')
        if (res.status === 204) return null;
        return res.text().then(text => text ? JSON.parse(text) : null);
      })
      .then(() => {
        setFormulario(null)
        cargarDatos()
      })
      .catch(err => {
        console.error("Error detallado:", err)
        alert(`Hubo un problema: ${err.message}`)
      })
      .finally(() => setGuardando(false))
  }

  // Eliminar un producto (DELETE)
  const eliminarProducto = (id, nombre) => {
    if (window.confirm(`¿Estás segura de que querés eliminar el producto "${nombre}"?`)) {
      fetch(`${URL_API}${id}/`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error('No se pudo eliminar')
          cargarDatos()
        })
        .catch(err => alert(err.message))
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      {/* Header Admin */}
      <header className="bg-neutral-900 text-white h-16 border-b border-neutral-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 🔗 Este botón ya estaba perfecto, ahora que recibe la prop va a funcionar al tacto */}
            <button 
              onClick={() => alCambiarDeVista('cliente')}
              className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white flex items-center gap-1.5 text-xs font-bold uppercase"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a la Tienda
            </button>
            <span className="h-5 w-px bg-neutral-700 hidden sm:block"></span>
            <h1 className="text-sm font-black uppercase tracking-wider text-amber-500 hidden sm:block">
              Panel de Control (CRUD)
            </h1>
          </div>

          <button 
            onClick={iniciarCreacion}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-3" /> Nuevo Producto
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Si el formulario está activo, lo mostramos arriba */}
        {Boolean(formulario) && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-md mb-8 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-3">
              <h2 className="text-base font-black uppercase tracking-tight text-neutral-800 flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-amber-600" />
                <span>{formulario.id ? `Editar Producto #${formulario.id}` : 'Crear Nuevo Producto'}</span>
              </h2>
              <button onClick={() => setFormulario(null)} className="text-xs font-bold text-neutral-400 hover:text-neutral-600 uppercase">
                Cancelar
              </button>
            </div>

            <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Nombre del producto</label>
                  <input required type="text" value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-700 focus:bg-white" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Descripción</label>
                  <textarea rows="3" value={formulario.descripcion} onChange={e => setFormulario({...formulario, descripcion: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-700 focus:bg-white resize-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">URL de la Imagen</label>
                  <input type="url" value={formulario.imagen_url} onChange={e => setFormulario({...formulario, imagen_url: e.target.value})} placeholder="https://ejemplo.com/foto.jpg" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-700 focus:bg-white" />
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/60 flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Categoría</label>
                  <select value={formulario.categoria} onChange={e => setFormulario({...formulario, categoria: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-hidden">
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">P. Minorista</label>
                    <input required type="number" step="0.01" value={formulario.precio_minorista} onChange={e => setFormulario({...formulario, precio_minorista: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">P. Mayorista</label>
                    <input required type="number" step="0.01" value={formulario.precio_mayorista} onChange={e => setFormulario({...formulario, precio_mayorista: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-hidden" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Stock Inicial</label>
                  <input 
                    required 
                    type="number" 
                    value={formulario.stock === 0 ? '' : formulario.stock} 
                    onChange={e => {
                      const valor = e.target.value;
                      setFormulario({
                        ...formulario, 
                        stock: valor === '' ? 0 : parseInt(valor, 10)
                      });
                    }} 
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-hidden" 
                  />
                </div>
                <button type="submit" disabled={guardando} className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs">
                  {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Guardar en Base de Datos</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de Productos */}
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider">Productos en Catálogo</h3>
            <button onClick={cargarDatos} className="p-1 text-neutral-400 hover:text-amber-800 transition-colors"><RefreshCw className="h-4 w-4" /></button>
          </div>

          {cargando ? (
            <div className="text-center py-12 text-sm text-neutral-500 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-800" /> 
              <span>Cargando listado...</span>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-400">
              <span>No hay productos registrados en Django. ¡Creá el primero!</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/30">
                    <th className="p-4 w-16">ID</th>
                    <th className="p-4">Producto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4 text-right">Minorista</th>
                    <th className="p-4 text-right">Mayorista</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {productos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 font-mono text-xs text-neutral-400">#{prod.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-neutral-100 border overflow-hidden shrink-0">
                            {prod.imagen_url ? <img src={prod.imagen_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[9px] text-neutral-400">No pic</div>}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block">{prod.nombre}</span>
                            <span className="text-xs text-neutral-400 font-mono line-clamp-1">{prod.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><span className="text-xs font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md uppercase">{prod.categoria_nombre}</span></td>
                      <td className="p-4 text-right font-bold text-neutral-900">${parseFloat(prod.precio_minorista).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right text-neutral-500">${parseFloat(prod.precio_mayorista).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${prod.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                          {prod.stock} u.
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => iniciarEdicion(prod)} className="p-2 text-neutral-400 hover:text-amber-800 hover:bg-neutral-100 rounded-lg transition-colors" title="Editar"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => eliminarProducto(prod.id, prod.nombre)} className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PanelAdmin