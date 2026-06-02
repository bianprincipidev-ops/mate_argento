import React, { useState, useEffect } from 'react'
import { ShoppingCart, Store, Package, Search, SlidersHorizontal, X, Plus, Minus, ShieldAlert, Trash2 } from 'lucide-react'

function CatalogoCliente({ alCambiarDeVista }) {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas')
  const [productoDetalle, setProductoDetalle] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  
  // 🛒 NUEVOS ESTADOS PARA EL CARRITO
  const [carrito, setCarrito] = useState([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/productos/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/categorias/').then(res => res.json()).catch(() => [])
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

  const abrirDetalle = (producto) => {
    setProductoDetalle(producto)
    setCantidad(1)
  }

  const incrementarCantidad = () => {
    if (cantidad < productoDetalle.stock) setCantidad(cantidad + 1)
  }

  const decrementarCantidad = () => {
    if (cantidad > 1) setCantidad(cantidad - 1)
  }

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

  // 🔄 FUNCIONES PARA MODIFICAR CANTIDADES ADENTRO DEL CARRITO
  const cambiarCantidadCarrito = (id, delta) => {
    setCarrito((carritoActual) => 
      carritoActual.map((item) => {
        if (item.id === id) {
          const nuevaCant = item.cantidadEnCarrito + delta
          if (nuevaCant > item.stock) {
            alert(`No hay más stock disponible de este modelo.`)
            return item
          }
          return { ...item, cantidadEnCarrito: nuevaCant }
        }
        return item
      }).filter((item) => item.cantidadEnCarrito > 0) // Si llega a 0, se elimina automáticamente
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((carritoActual) => carritoActual.filter(item => item.id !== id));
  };

  const totalItemsEnCarrito = carrito.reduce((acc, item) => acc + item.cantidadEnCarrito, 0)
  
  // Calcular el precio total final
  const precioTotalCarrito = carrito.reduce((acc, item) => acc + (parseFloat(item.precio_minorista) * item.cantidadEnCarrito), 0)

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaSeleccionada === 'todas' || producto.categoria_nombre === categoriaSeleccionada
    return coincideBusqueda && coincideCategoria
  })

  // Enviar pedido por WhatsApp
  const enviarPedidoWhatsApp = () => {
    let mensaje = `*¡Hola Mate Argento! Quisiera hacer el siguiente pedido:*%0A%0A`;
    carrito.forEach(item => {
      mensaje += `• ${item.cantidadEnCarrito}x ${item.nombre} ($${parseFloat(item.precio_minorista).toLocaleString('es-AR')} c/u)%0A`;
    });
    mensaje += `%0A*Total estimado: $${precioTotalCarrito.toLocaleString('es-AR')}*`;
    
    // Cambiá este número por el tuyo real (con código de país sin el +)
    const tuNumeroTelefono = "5493584307268"; 
    window.open(`https://wa.me/${tuNumeroTelefono}?text=${mensaje}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col relative">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-amber-800" />
            <span className="text-xl font-black text-amber-950 tracking-tight">MATE ARGENTO</span>
          </div>
          
          {/* Al hacer click, cambia a true y abre el panel lateral */}
          <button 
            onClick={() => setCarritoAbierto(true)}
            className="relative p-2 text-neutral-600 hover:text-amber-800 transition-colors group"
          >
            <ShoppingCart className="h-6 w-6 group-hover:scale-105 transition-transform" />
            {totalItemsEnCarrito > 0 && (
              <span className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center">
                {totalItemsEnCarrito}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        {/* Filtros */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 mb-8 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar tu mate..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-700 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <SlidersHorizontal className="h-4 w-4 text-neutral-400 shrink-0 hidden sm:inline" />
            <button
              onClick={() => setCategoriaSeleccionada('todas')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${categoriaSeleccionada === 'todas' ? 'bg-amber-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaSeleccionada(cat.nombre)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${categoriaSeleccionada === cat.nombre ? 'bg-amber-800 text-white' : 'bg-neutral-100 text-neutral-600'}`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        {cargando ? (
          <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800 mx-auto mb-2"></div>Cargando...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-2xl"><Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" /><p className="text-sm text-neutral-500">No hay productos.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div onClick={() => abrirDetalle(producto)} className="aspect-square bg-neutral-100 relative overflow-hidden group cursor-pointer">
                  {producto.imagen_url ? <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">Sin imagen</div>}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-neutral-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">{producto.categoria_nombre}</span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 onClick={() => abrirDetalle(producto)} className="font-bold text-neutral-950 text-base line-clamp-1 mb-1 cursor-pointer hover:text-amber-800">{producto.nombre}</h3>
                    <p className="text-neutral-500 text-xs line-clamp-2 min-h-8 mb-4">{producto.descripcion || 'Sin descripción.'}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-black text-amber-900">
                        <span>$</span>
                        <span>{parseFloat(producto.precio_minorista).toLocaleString('es-AR')}</span>
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        <span>(May: $</span>
                        <span>{parseFloat(producto.precio_mayorista).toLocaleString('es-AR')}</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-100">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <span>Stock: </span>
                        <span>{producto.stock}</span>
                        <span> u.</span>
                      </span>
                      <button disabled={producto.stock <= 0} onClick={() => agregarAlCarrito(producto, 1)} className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-3 py-2 rounded-xl disabled:bg-neutral-200">Agregar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🛒 SIDEBAR LATERAL DEL CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Fondo oscuro traslúcido */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setCarritoAbierto(false)}></div>
          
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              {/* Header del carrito */}
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-lg font-black text-neutral-950 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-amber-800" /> Mi Carrito
                </h2>
                <button onClick={() => setCarritoAbierto(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              {/* Lista de productos dentro del carrito */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {carrito.length === 0 ? (
                  <div className="text-center py-20 text-neutral-400">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold">Tu carrito está vacío.</p>
                    <p className="text-xs mt-1">¡Elegí los mejores mates para empezar!</p>
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-neutral-50 border rounded-xl relative">
                      <div className="h-16 w-16 bg-neutral-200 rounded-lg overflow-hidden shrink-0">
                        {item.imagen_url && <img src={item.imagen_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-sm text-neutral-900 line-clamp-1 pr-6">{item.nombre}</span>
                          <span className="text-xs text-amber-900 font-black block mt-0.5">
                            <span>$</span>
                            <span>{parseFloat(item.precio_minorista).toLocaleString('es-AR')}</span>
                          </span>
                        </div>
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => cambiarCantidadCarrito(item.id, -1)} className="p-1 rounded-md bg-white border hover:bg-neutral-100"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-black w-6 text-center">{item.cantidadEnCarrito}</span>
                          <button onClick={() => cambiarCantidadCarrito(item.id, 1)} className="p-1 rounded-md bg-white border hover:bg-neutral-100"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.id)} className="absolute top-3 right-3 text-neutral-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer con el total y botón de checkout */}
              {carrito.length > 0 && (
                <div className="p-6 border-t bg-neutral-50">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm font-bold text-neutral-500">Subtotal</span>
                    <span className="text-xl font-black text-neutral-950">
                      <span>$</span>
                      <span>{precioTotalCarrito.toLocaleString('es-AR')}</span>
                    </span>
                  </div>
                  <button 
                    onClick={enviarPedidoWhatsApp}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md text-center block"
                  >
                    Pedir por WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE */}
      {productoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setProductoDetalle(null)}></div>
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row">
            <button onClick={() => setProductoDetalle(null)} className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full border shadow-xs"><X className="h-4 w-4" /></button>
            <div className="w-full md:w-1/2 aspect-square bg-neutral-50">
              {productoDetalle.imagen_url ? <img src={productoDetalle.imagen_url} alt={productoDetalle.nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-400">Sin imagen</div>}
            </div>
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-white">
              <div>
                <span className="text-[10px] font-extrabold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">{productoDetalle.categoria_nombre}</span>
                <h2 className="text-xl font-black text-neutral-950 mb-2">{productoDetalle.nombre}</h2>
                <div className="border-t pt-4 mb-6">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase mb-2">Descripción</h4>
                  <p className="text-sm text-neutral-600 max-h-30 overflow-y-auto">{productoDetalle.descripcion || 'Sin descripción.'}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-2xl font-black text-amber-950">
                    <span>$</span>
                    <span>{parseFloat(productoDetalle.precio_minorista).toLocaleString('es-AR')}</span>
                  </span>
                  <span className="text-xs text-neutral-500">
                    <span>Por mayor: </span>
                    <span className="font-bold">
                      <span>$</span>
                      <span>{parseFloat(productoDetalle.precio_mayorista).toLocaleString('es-AR')}</span>
                    </span>
                  </span>
                </div>
                {productoDetalle.stock > 0 && (
                  <div className="flex items-center gap-3 mb-4 bg-neutral-50 p-2 rounded-xl border w-fit">
                    <span className="text-xs font-bold text-neutral-500 px-2">Cantidad:</span>
                    <div className="flex items-center gap-1">
                      <button onClick={decrementarCantidad} disabled={cantidad <= 1} className="p-1.5 rounded-lg bg-white border"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-black">{cantidad}</span>
                      <button onClick={incrementarCantidad} disabled={cantidad >= productoDetalle.stock} className="p-1.5 rounded-lg bg-white border"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className={`text-xs font-bold ${productoDetalle.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {productoDetalle.stock > 0 ? (
                      <span>{productoDetalle.stock} disponibles</span>
                    ) : (
                      <span>Sin stock</span>
                    )}
                  </span>
                  <button disabled={productoDetalle.stock <= 0} onClick={() => agregarAlCarrito(productoDetalle, cantidad)} className="bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold px-5 py-3 rounded-xl">Agregar al carrito</button>
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