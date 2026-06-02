import React, { useState, useEffect } from 'react'
import CatalogoCliente from './components/CatalogoCliente'
import PanelAdmin from './components/PanelAdmin'
import { auth } from './firbebase';

// 🔑 PONÉ ACÁ TU EMAIL EXACTO CON EL QUE TE VAS A LOGUEAR COMO ADMIN
const EMAIL_ADMIN = "tu-email-de-administradora@gmail.com"; 

function App() {
  const [vista, setVista] = useState('cliente')
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)

  useEffect(() => {
    const desubscribir = auth.onAuthStateChanged((user) => {
      setUsuario(user)
      setCargandoAuth(false)
      
      if (!user && window.location.pathname === '/admin') {
        setVista('cliente')
        window.history.pushState({}, '', '/')
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
        />
      )}
    </>
  )
}

export default App