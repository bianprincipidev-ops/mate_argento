import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, PackagePlus, RefreshCw } from 'lucide-react'
// Ruta del logo — ajustá si lo guardás en otra carpeta
import logo from '../assets/logo.png'

function PanelAdmin({ alCambiarDeVista }) {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [formulario, setFormulario] = useState(null)

  const URL_API = 'http://127.0.0.1:8000/api/productos/'
  const URL_CAT = 'http://127.0.0.1:8000/api/categorias/'

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      fetch(URL_API).then(res => res.json()),
      fetch(URL_CAT).then(res => res.json()).catch(() => [])
    ])
      .then(([dataProd, dataCat]) => { setProductos(dataProd); setCategorias(dataCat); setCargando(false) })
      .catch(() => setCargando(false))
  }

  useEffect(() => { cargarDatos() }, [])

  const iniciarCreacion = () => {
    setFormulario({ nombre: '', descripcion: '', precio_minorista: '', precio_mayorista: '', stock: 0, categoria: categorias[0]?.id || '', imagen_url: '' })
  }

  const iniciarEdicion = (producto) => {
    const categoriaId = producto.categoria && typeof producto.categoria === 'object' ? producto.categoria.id : producto.categoria
    setFormulario({ id: producto.id, nombre: producto.nombre, descripcion: producto.descripcion || '', precio_minorista: producto.precio_minorista, precio_mayorista: producto.precio_mayorista, stock: producto.stock, categoria: categoriaId || '', imagen_url: producto.imagen_url || '' })
  }

  const guardarProducto = (e) => {
    e.preventDefault()
    setGuardando(true)
    const esEdicion = Boolean(formulario.id)
    fetch(esEdicion ? `${URL_API}${formulario.id}/` : URL_API, {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formulario)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar en el servidor')
        if (res.status === 204) return null
        return res.text().then(text => text ? JSON.parse(text) : null)
      })
      .then(() => { setFormulario(null); cargarDatos() })
      .catch(err => { console.error(err); alert(`Hubo un problema: ${err.message}`) })
      .finally(() => setGuardando(false))
  }

  const eliminarProducto = (id, nombre) => {
    if (window.confirm(`¿Estás segura de que querés eliminar "${nombre}"?`)) {
      fetch(`${URL_API}${id}/`, { method: 'DELETE' })
        .then(res => { if (!res.ok) throw new Error('No se pudo eliminar'); cargarDatos() })
        .catch(err => alert(err.message))
    }
  }

  // Clases reutilizables para inputs
  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
  const inputStyle = { backgroundColor: '#fff', border: '1px solid #D6E8F5' }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <header className="h-16 border-b sticky top-0 z-30 shadow-sm" style={{ backgroundColor: '#1A5C8A', borderColor: '#144A72' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => alCambiarDeVista('cliente')}
              className="flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-2 rounded-xl transition-colors"
              style={{ color: '#B8D9F0' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#B8D9F0' }}
            >
              <ArrowLeft className="h-4 w-4" /> Volver a la Tienda
            </button>
            <span className="h-5 w-px hidden sm:block" style={{ backgroundColor: '#2E7AAD' }}></span>
            <div className="hidden sm:flex items-center gap-2">
              <img src={logo} alt="" className="h-7 w-7 rounded-full object-cover" />
              <h1 className="text-sm font-black uppercase tracking-wider" style={{ color: '#F5A623' }}>
                Panel de Control
              </h1>
            </div>
          </div>

          <button
            onClick={iniciarCreacion}
            className="text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: '#F5A623' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#D4911F'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F5A623'}
          >
            <Plus className="h-4 w-4" /> Nuevo Producto
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Formulario */}
        {Boolean(formulario) && (
          <div className="bg-white rounded-3xl p-6 shadow-md mb-8 animate-in fade-in slide-in-from-top-4 duration-200" style={{ border: '1px solid #D6E8F5' }}>
            <div className="flex justify-between items-center mb-6 pb-3" style={{ borderBottom: '1px solid #EEF6FD' }}>
              <h2 className="text-base font-black uppercase tracking-tight flex items-center gap-2" style={{ color: '#1A5C8A' }}>
                <PackagePlus className="h-5 w-5" style={{ color: '#F5A623' }} />
                {formulario.id ? `Editar Producto #${formulario.id}` : 'Crear Nuevo Producto'}
              </h2>
              <button
                onClick={() => setFormulario(null)}
                className="text-xs font-bold uppercase transition-colors"
                style={{ color: '#5BA4CF' }}
                onMouseEnter={e => e.currentTarget.style.color = '#1A5C8A'}
                onMouseLeave={e => e.currentTarget.style.color = '#5BA4CF'}
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#5BA4CF' }}>Nombre del producto</label>
                  <input required type="text" value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})}
                    className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                    onBlur={e => e.target.style.borderColor = '#D6E8F5'}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#5BA4CF' }}>Descripción</label>
                  <textarea rows="3" value={formulario.descripcion} onChange={e => setFormulario({...formulario, descripcion: e.target.value})}
                    className={`${inputClass} resize-none`} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                    onBlur={e => e.target.style.borderColor = '#D6E8F5'}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#5BA4CF' }}>URL de la Imagen</label>
                  <input type="url" value={formulario.imagen_url} onChange={e => setFormulario({...formulario, imagen_url: e.target.value})}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                    onBlur={e => e.target.style.borderColor = '#D6E8F5'}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: '#EEF6FD', border: '1px solid #D6E8F5' }}>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#5BA4CF' }}>Categoría</label>
                  <select value={formulario.categoria} onChange={e => setFormulario({...formulario, categoria: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: '#fff', border: '1px solid #D6E8F5', color: '#1A5C8A' }}
                  >
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#5BA4CF' }}>P. Minorista</label>
                    <input required type="number" step="0.01" value={formulario.precio_minorista} onChange={e => setFormulario({...formulario, precio_minorista: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                      style={{ backgroundColor: '#fff', border: '1px solid #D6E8F5' }}
                      onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                      onBlur={e => e.target.style.borderColor = '#D6E8F5'}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#5BA4CF' }}>P. Mayorista</label>
                    <input required type="number" step="0.01" value={formulario.precio_mayorista} onChange={e => setFormulario({...formulario, precio_mayorista: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                      style={{ backgroundColor: '#fff', border: '1px solid #D6E8F5' }}
                      onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                      onBlur={e => e.target.style.borderColor = '#D6E8F5'}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#5BA4CF' }}>Stock Inicial</label>
                  <input required type="number"
                    value={formulario.stock === 0 ? '' : formulario.stock}
                    onChange={e => setFormulario({...formulario, stock: e.target.value === '' ? 0 : parseInt(e.target.value, 10)})}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: '#fff', border: '1px solid #D6E8F5' }}
                    onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                    onBlur={e => e.target.style.borderColor = '#D6E8F5'}
                  />
                </div>
                <button type="submit" disabled={guardando}
                  className="w-full mt-2 text-white font-bold text-xs uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#1A5C8A' }}
                  onMouseEnter={e => { if (!guardando) e.currentTarget.style.backgroundColor = '#144A72' }}
                  onMouseLeave={e => { if (!guardando) e.currentTarget.style.backgroundColor = '#1A5C8A' }}
                >
                  {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Guardar en Base de Datos</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden" style={{ border: '1px solid #D6E8F5' }}>
          <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid #D6E8F5', backgroundColor: '#EEF6FD' }}>
            <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: '#5BA4CF' }}>Productos en Catálogo</h3>
            <button onClick={cargarDatos} className="p-1 transition-colors" style={{ color: '#5BA4CF' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1A5C8A'}
              onMouseLeave={e => e.currentTarget.style.color = '#5BA4CF'}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {cargando ? (
            <div className="text-center py-12 flex flex-col items-center gap-2" style={{ color: '#5BA4CF' }}>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Cargando listado...</span>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-400">
              No hay productos registrados. ¡Creá el primero!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid #D6E8F5', backgroundColor: '#F7F9FC', color: '#5BA4CF' }}>
                    <th className="p-4 w-16">ID</th>
                    <th className="p-4">Producto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4 text-right">Minorista</th>
                    <th className="p-4 text-right">Mayorista</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.id} className="transition-colors" style={{ borderBottom: '1px solid #EEF6FD' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F9FC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="p-4 font-mono text-xs" style={{ color: '#5BA4CF' }}>#{prod.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#EEF6FD', border: '1px solid #D6E8F5' }}>
                            {prod.imagen_url
                              ? <img src={prod.imagen_url} alt="" className="h-full w-full object-cover" />
                              : <div className="h-full w-full flex items-center justify-center text-[9px]" style={{ color: '#5BA4CF' }}>No pic</div>
                            }
                          </div>
                          <div>
                            <span className="font-bold block" style={{ color: '#1A5C8A' }}>{prod.nombre}</span>
                            <span className="text-xs font-mono line-clamp-1 text-neutral-400">{prod.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase" style={{ backgroundColor: '#EEF6FD', color: '#1A5C8A' }}>
                          {prod.categoria_nombre}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold" style={{ color: '#8B5E3C' }}>
                        ${parseFloat(prod.precio_minorista).toLocaleString('es-AR')}
                      </td>
                      <td className="p-4 text-right text-neutral-500">
                        ${parseFloat(prod.precio_mayorista).toLocaleString('es-AR')}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                          style={prod.stock > 0
                            ? { backgroundColor: '#EAF5EC', color: '#3A7D44' }
                            : { backgroundColor: '#FEF2F2', color: '#DC2626' }
                          }
                        >
                          {prod.stock} u.
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => iniciarEdicion(prod)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#5BA4CF' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#1A5C8A'; e.currentTarget.style.backgroundColor = '#EEF6FD' }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#5BA4CF'; e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => eliminarProducto(prod.id, prod.nombre)}
                            className="p-2 rounded-lg transition-colors text-neutral-400"
                            onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.backgroundColor = '#FEF2F2' }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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