import React, { useState, useEffect } from 'react'
import CatalogoCliente from './components/CatalogoCliente'
import PanelAdmin from './components/PanelAdmin'
import ModalLogin from './components/ModalLogin'
import { auth } from './firebase';

const EMAIL_ADMIN = "colorhada2026@gmail.com";

function App() {
  const [vista, setVista] = useState('cliente')
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)

  // NUEVO: estado global del modal de login
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false)

  useEffect(() => {
    const desubscribir = auth.onAuthStateChanged((user) => {
      setUsuario(user)
      setCargandoAuth(false)

      if (!user && window.location.pathname === '/admin') {
        setVista('cliente')
        window.history.pushState({}, '', '/')
      }

      // Si el usuario se loguea con éxito, cerramos el modal automáticamente
      if (user) {
        setMostrarModalLogin(false)
      }
    })
    return () => desubscribir()
  }, [])

  const navegarA = (nuevaVista) => {
    setVista(nuevaVista)
    const nuevaRuta = nuevaVista === 'admin' ? '/admin' : '/'
    window.history.pushState({}, '', nuevaRuta)
  }

  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
      </div>
    )
  }

  const esAdmin = usuario && usuario.email === EMAIL_ADMIN;

  return (
    <>
      {vista === 'admin' && esAdmin ? (
        <PanelAdmin alCambiarDeVista={navegarA} usuario={usuario} />
      ) : (
        <CatalogoCliente
          alCambiarDeVista={navegarA}
          usuarioLogueado={usuario}
          esAdmin={esAdmin}
          setMostrarModalLogin={setMostrarModalLogin}
        />
      )}

      {/* Modal de login global — se muestra encima de todo */}
      {mostrarModalLogin && (
        <ModalLogin onCerrar={() => setMostrarModalLogin(false)} />
      )}
    </>
  )
}

export default App