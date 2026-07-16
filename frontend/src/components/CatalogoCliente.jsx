import React, { useState, useEffect } from 'react'
import { ShoppingCart, Package, Search, SlidersHorizontal, X, Plus, Minus, Trash2, LogIn, LogOut, User, LayoutDashboard } from 'lucide-react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

// Ruta del logo — ajustá si lo guardás en otra carpeta
import logo from '../assets/logo.png'

function CatalogoCliente({ alCambiarDeVista, usuarioLogueado, esAdmin, setMostrarModalLogin }) {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)

  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas')
  const [productoDetalle, setProductoDetalle] = useState(null)
  const [cantidad, setCantidad] = useState(1)

  const [carrito, setCarrito] = useState([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/productos').then(res => res.json()), 
      fetch('/api/categorias').then(res => res.json()).catch(() => []) 
    ])
      .then(([dataProductos, dataCategorias]) => {
        setProductos(dataProductos)
        setCategorias(dataCategorias)
        setCargando(false)
      })
      .catch((error) => {
        console.error('Error al cargar los datos:', error)
        setCargando(false)
      })
  }, [])

  const abrirDetalle = (producto) => { setProductoDetalle(producto); setCantidad(1) }
  const incrementarCantidad = () => { if (cantidad < productoDetalle.stock) setCantidad(cantidad + 1) }
  const decrementarCantidad = () => { if (cantidad > 1) setCantidad(cantidad - 1) }

  const agregarAlCarrito = (producto, cantidadAAgregar) => {
    setCarrito((carritoActual) => {
      const itemExistente = carritoActual.find((item) => item.id === producto.id)
      if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidadEnCarrito + cantidadAAgregar
        if (nuevaCantidad > producto.stock) {
          alert(`¡Ups! Solo quedan ${producto.stock} unidades disponibles.`)
          return carritoActual.map((item) =>
            item.id === producto.id ? { ...item, cantidadEnCarrito: producto.stock } : item
          )
        }
        return carritoActual.map((item) =>
          item.id === producto.id ? { ...item, cantidadEnCarrito: nuevaCantidad } : item
        )
      }
      return [...carritoActual, { ...producto, cantidadEnCarrito: cantidadAAgregar }]
    })
    setProductoDetalle(null)
  }

  const cambiarCantidadCarrito = (id, delta) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) => {
        if (item.id === id) {
          const nuevaCant = item.cantidadEnCarrito + delta
          if (nuevaCant > item.stock) { alert(`No hay más stock disponible.`); return item }
          return { ...item, cantidadEnCarrito: nuevaCant }
        }
        return item
      }).filter((item) => item.cantidadEnCarrito > 0)
    )
  }

  const eliminarDelCarrito = (id) => setCarrito((c) => c.filter(item => item.id !== id))

  const totalItemsEnCarrito = carrito.reduce((acc, item) => acc + item.cantidadEnCarrito, 0)
  const precioTotalCarrito = carrito.reduce((acc, item) => acc + (parseFloat(item.precio_minorista) * item.cantidadEnCarrito), 0)

  const handleCerrarSesion = async () => { await signOut(auth) }

  const enviarPedidoWhatsApp = () => {
    if (!usuarioLogueado) { setCarritoAbierto(false); setMostrarModalLogin(true); return }
    const telefono = "5493584307268"
    let mensaje = "¡Hola! Me gustaría hacer el siguiente pedido:\n\n"
    carrito.forEach(item => {
      mensaje += `- ${item.nombre} (Cantidad: ${item.cantidadEnCarrito}) - $${(parseFloat(item.precio_minorista) * item.cantidadEnCarrito).toLocaleString('es-AR')}\n`
    })
    mensaje += `\n*Total: $${precioTotalCarrito.toLocaleString('es-AR')}*`
    mensaje += `\n\nCliente: ${usuarioLogueado.displayName || usuarioLogueado.email}`
    window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaSeleccionada === 'todas' || producto.categoria_nombre === categoriaSeleccionada
    return coincideBusqueda && coincideCategoria
  })

  return (
    <div className="min-h-screen text-neutral-900 flex flex-col relative" style={{ backgroundColor: '#F7F9FC' }}>

      {/* ── NAVBAR ── */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm" style={{ borderColor: '#D6E8F5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo + nombre */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Mate Argento" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xl font-black tracking-tight" style={{ color: '#1A5C8A' }}>
              MATE ARGENTO
            </span>
          </div>

          {/* Zona derecha */}
          <div className="flex items-center gap-2">
            {usuarioLogueado ? (
              <div className="flex items-center gap-2">
                {/* Pastilla usuario */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 border" style={{ backgroundColor: '#EEF6FD', borderColor: '#B8D9F0' }}>
                  {usuarioLogueado.photoURL ? (
                    <img src={usuarioLogueado.photoURL} alt="" className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" style={{ color: '#5BA4CF' }} />
                  )}
                  <span className="text-xs font-bold max-w-30 truncate" style={{ color: '#1A5C8A' }}>
                    {usuarioLogueado.displayName || usuarioLogueado.email}
                  </span>
                </div>

                {/* Botón admin */}
                {esAdmin && (
                  <button
                    onClick={() => alCambiarDeVista('admin')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                    style={{ color: '#8B5E3C', backgroundColor: '#FDF4EC', borderColor: '#E8C99A' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5E6D0'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FDF4EC'}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Panel Admin</span>
                  </button>
                )}

                {/* Cerrar sesión */}
                <button
                  onClick={handleCerrarSesion}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-transparent transition-all text-neutral-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMostrarModalLogin(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                style={{ color: '#1A5C8A', backgroundColor: '#EEF6FD', borderColor: '#B8D9F0' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#D6E8F5'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EEF6FD'}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            )}

            {/* Carrito */}
            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative p-2 transition-colors group rounded-xl"
              style={{ color: '#5BA4CF' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1A5C8A'}
              onMouseLeave={e => e.currentTarget.style.color = '#5BA4CF'}
            >
              <ShoppingCart className="h-6 w-6 group-hover:scale-105 transition-transform" />
              {totalItemsEnCarrito > 0 && (
                <span className="absolute top-0 right-0 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5A623' }}>
                  {totalItemsEnCarrito}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">

        {/* Filtros */}
        <div className="bg-white border rounded-2xl p-4 mb-8 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between" style={{ borderColor: '#D6E8F5' }}>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5BA4CF' }} />
            <input
              type="text"
              placeholder="Buscar tu mate..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none transition-all"
              style={{ backgroundColor: '#F7F9FC', borderColor: '#D6E8F5' }}
              onFocus={e => { e.target.style.borderColor = '#5BA4CF'; e.target.style.backgroundColor = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#D6E8F5'; e.target.style.backgroundColor = '#F7F9FC' }}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <SlidersHorizontal className="h-4 w-4 shrink-0 hidden sm:inline" style={{ color: '#5BA4CF' }} />
            <button
              onClick={() => setCategoriaSeleccionada('todas')}
              className="text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap"
              style={categoriaSeleccionada === 'todas'
                ? { backgroundColor: '#1A5C8A', color: '#fff' }
                : { backgroundColor: '#EEF6FD', color: '#5BA4CF' }}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaSeleccionada(cat.nombre)}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                style={categoriaSeleccionada === cat.nombre
                  ? { backgroundColor: '#1A5C8A', color: '#fff' }
                  : { backgroundColor: '#EEF6FD', color: '#5BA4CF' }}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        {cargando ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: '#5BA4CF' }}></div>
            <span className="text-sm" style={{ color: '#5BA4CF' }}>Cargando...</span>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-2xl" style={{ borderColor: '#B8D9F0' }}>
            <Package className="h-10 w-10 mx-auto mb-3" style={{ color: '#B8D9F0' }} />
            <p className="text-sm text-neutral-500">No hay productos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col" style={{ borderColor: '#D6E8F5' }}>
                <div onClick={() => abrirDetalle(producto)} className="aspect-square relative overflow-hidden group cursor-pointer" style={{ backgroundColor: '#EEF6FD' }}>
                  {producto.imagen_url
                    ? <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: '#5BA4CF' }}>Sin imagen</div>
                  }
                  <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase" style={{ color: '#1A5C8A' }}>
                    {producto.categoria_nombre}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 onClick={() => abrirDetalle(producto)} className="font-bold text-base line-clamp-1 mb-1 cursor-pointer transition-colors hover:text-[#1A5C8A] text-neutral-950">
                      {producto.nombre}
                    </h3>
                    <p className="text-neutral-500 text-xs line-clamp-2 min-h-8 mb-4">{producto.descripcion || 'Sin descripción.'}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-black" style={{ color: '#8B5E3C' }}>
                        ${parseFloat(producto.precio_minorista).toLocaleString('es-AR')}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        (May: ${parseFloat(producto.precio_mayorista).toLocaleString('es-AR')})
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: '#EEF6FD' }}>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ color: '#3A7D44', backgroundColor: '#EAF5EC' }}>
                        Stock: {producto.stock} u.
                      </span>
                      <button
                        disabled={producto.stock <= 0}
                        onClick={() => agregarAlCarrito(producto, 1)}
                        className="text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
                        style={{ backgroundColor: '#1A5C8A' }}
                        onMouseEnter={e => { if (producto.stock > 0) e.currentTarget.style.backgroundColor = '#144A72' }}
                        onMouseLeave={e => { if (producto.stock > 0) e.currentTarget.style.backgroundColor = '#1A5C8A' }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── SIDEBAR CARRITO ── */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setCarritoAbierto(false)}></div>
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">

              {/* Header carrito */}
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#D6E8F5' }}>
                <h2 className="text-lg font-black flex items-center gap-2" style={{ color: '#1A5C8A' }}>
                  <ShoppingCart className="h-5 w-5" style={{ color: '#5BA4CF' }} /> Mi Carrito
                </h2>
                <button onClick={() => setCarritoAbierto(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {carrito.length === 0 ? (
                  <div className="text-center py-20 text-neutral-400">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold">Tu carrito está vacío.</p>
                    <p className="text-xs mt-1">¡Elegí los mejores mates para empezar!</p>
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 border rounded-xl relative" style={{ backgroundColor: '#F7F9FC', borderColor: '#D6E8F5' }}>
                      <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#EEF6FD' }}>
                        {item.imagen_url && <img src={item.imagen_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-sm text-neutral-900 line-clamp-1 pr-6">{item.nombre}</span>
                          <span className="text-xs font-black block mt-0.5" style={{ color: '#8B5E3C' }}>
                            ${parseFloat(item.precio_minorista).toLocaleString('es-AR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => cambiarCantidadCarrito(item.id, -1)} className="p-1 rounded-md bg-white border hover:bg-neutral-100" style={{ borderColor: '#D6E8F5' }}><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-black w-6 text-center">{item.cantidadEnCarrito}</span>
                          <button onClick={() => cambiarCantidadCarrito(item.id, 1)} className="p-1 rounded-md bg-white border hover:bg-neutral-100" style={{ borderColor: '#D6E8F5' }}><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.id)} className="absolute top-3 right-3 text-neutral-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer carrito */}
              {carrito.length > 0 && (
                <div className="p-6 border-t" style={{ borderColor: '#D6E8F5', backgroundColor: '#F7F9FC' }}>
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm font-bold text-neutral-500">Subtotal</span>
                    <span className="text-xl font-black" style={{ color: '#1A5C8A' }}>
                      ${precioTotalCarrito.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {!usuarioLogueado && (
                    <p className="text-xs text-center text-neutral-500 mb-3">
                      Necesitás{' '}
                      <button
                        onClick={() => { setCarritoAbierto(false); setMostrarModalLogin(true) }}
                        className="font-bold hover:underline" style={{ color: '#1A5C8A' }}
                      >
                        iniciar sesión
                      </button>
                      {' '}para finalizar tu pedido.
                    </p>
                  )}

                  <button
                    onClick={enviarPedidoWhatsApp}
                    className="w-full text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md"
                    style={{ backgroundColor: '#25D366' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1fba59'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#25D366'}
                  >
                    {usuarioLogueado ? 'Pedir por WhatsApp' : 'Iniciá sesión para pedir'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE ── */}
      {productoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setProductoDetalle(null)}></div>
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row">
            <button onClick={() => setProductoDetalle(null)} className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full border shadow-xs" style={{ borderColor: '#D6E8F5' }}>
              <X className="h-4 w-4" />
            </button>

            <div className="w-full md:w-1/2 aspect-square" style={{ backgroundColor: '#EEF6FD' }}>
              {productoDetalle.imagen_url
                ? <img src={productoDetalle.imagen_url} alt={productoDetalle.nombre} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-neutral-400">Sin imagen</div>
              }
            </div>

            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-white">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider mb-3 inline-block" style={{ backgroundColor: '#EEF6FD', color: '#1A5C8A' }}>
                  {productoDetalle.categoria_nombre}
                </span>
                <h2 className="text-xl font-black text-neutral-950 mb-2">{productoDetalle.nombre}</h2>
                <div className="border-t pt-4 mb-6" style={{ borderColor: '#EEF6FD' }}>
                  <h4 className="text-xs font-bold uppercase mb-2" style={{ color: '#5BA4CF' }}>Descripción</h4>
                  <p className="text-sm text-neutral-600 max-h-30 overflow-y-auto">{productoDetalle.descripcion || 'Sin descripción.'}</p>
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: '#EEF6FD' }}>
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-2xl font-black" style={{ color: '#8B5E3C' }}>
                    ${parseFloat(productoDetalle.precio_minorista).toLocaleString('es-AR')}
                  </span>
                  <span className="text-xs text-neutral-500">
                    Por mayor: <span className="font-bold" style={{ color: '#8B5E3C' }}>${parseFloat(productoDetalle.precio_mayorista).toLocaleString('es-AR')}</span>
                  </span>
                </div>

                {productoDetalle.stock > 0 && (
                  <div className="flex items-center gap-3 mb-4 p-2 rounded-xl border w-fit" style={{ backgroundColor: '#F7F9FC', borderColor: '#D6E8F5' }}>
                    <span className="text-xs font-bold px-2" style={{ color: '#5BA4CF' }}>Cantidad:</span>
                    <div className="flex items-center gap-1">
                      <button onClick={decrementarCantidad} disabled={cantidad <= 1} className="p-1.5 rounded-lg bg-white border" style={{ borderColor: '#D6E8F5' }}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-black">{cantidad}</span>
                      <button onClick={incrementarCantidad} disabled={cantidad >= productoDetalle.stock} className="p-1.5 rounded-lg bg-white border" style={{ borderColor: '#D6E8F5' }}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <span className={`text-xs font-bold ${productoDetalle.stock > 0 ? '' : 'text-rose-600'}`} style={productoDetalle.stock > 0 ? { color: '#3A7D44' } : {}}>
                    {productoDetalle.stock > 0 ? `${productoDetalle.stock} disponibles` : 'Sin stock'}
                  </span>
                  <button
                    disabled={productoDetalle.stock <= 0}
                    onClick={() => agregarAlCarrito(productoDetalle, cantidad)}
                    className="text-white text-sm font-bold px-5 py-3 rounded-xl disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors"
                    style={{ backgroundColor: '#1A5C8A' }}
                    onMouseEnter={e => { if (productoDetalle.stock > 0) e.currentTarget.style.backgroundColor = '#144A72' }}
                    onMouseLeave={e => { if (productoDetalle.stock > 0) e.currentTarget.style.backgroundColor = '#1A5C8A' }}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogoCliente