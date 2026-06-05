import React, { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
// Ruta del logo — ajustá si lo guardás en otra carpeta
import logo from '../assets/logo.png'

function ModalLogin({ onCerrar }) {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const limpiarError = () => setError('')

  const mensajeError = (codigo) => {
    const errores = {
      'auth/user-not-found': 'No existe una cuenta con ese email.',
      'auth/wrong-password': 'La contraseña es incorrecta.',
      'auth/email-already-in-use': 'Ese email ya está registrado.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-email': 'El email no tiene un formato válido.',
      'auth/invalid-credential': 'Email o contraseña incorrectos.',
      'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos.',
      'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
    }
    return errores[codigo] || 'Ocurrió un error. Intentá de nuevo.'
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos.'); return }
    setCargando(true); limpiarError()
    try {
      if (modo === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      onCerrar()
    } catch (err) {
      setError(mensajeError(err.code))
    } finally {
      setCargando(false)
    }
  }

  const handleGoogle = async () => {
    setCargando(true); limpiarError()
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      onCerrar()
    } catch (err) {
      setError(mensajeError(err.code))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onCerrar} />

      <div className="relative z-10 bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" style={{ border: '1px solid #D6E8F5' }}>

        {/* Cabecera azul marino del logo */}
        <div className="px-8 pt-8 pb-6 text-center relative" style={{ backgroundColor: '#1A5C8A' }}>
          <button
            onClick={onCerrar}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Logo en el header */}
          <div className="flex items-center justify-center mb-3">
            <img src={logo} alt="Mate Argento" className="h-14 w-14 rounded-full object-cover border-2 border-white/30" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {modo === 'login' ? 'Bienvenida de vuelta' : 'Creá tu cuenta'}
          </h2>
          <p className="text-xs mt-1" style={{ color: '#B8D9F0' }}>
            {modo === 'login'
              ? 'Iniciá sesión para finalizar tu pedido'
              : 'Registrate para hacer tu primer pedido'}
          </p>
        </div>

        {/* Cuerpo */}
        <div className="px-8 py-6" style={{ backgroundColor: '#F7F9FC' }}>

          {/* Botón Google */}
          <button
            onClick={handleGoogle}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-3 bg-white font-bold text-sm py-3 rounded-xl transition-colors mb-5 disabled:opacity-50"
            style={{ border: '1px solid #D6E8F5', color: '#1A5C8A' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EEF6FD'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          {/* Separador */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: '#D6E8F5' }} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#5BA4CF' }}>o con email</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#D6E8F5' }} />
          </div>

          {/* Formulario */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5BA4CF' }} />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); limpiarError() }}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{ backgroundColor: '#fff', border: '1px solid #D6E8F5' }}
                onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                onBlur={e => e.target.style.borderColor = '#D6E8F5'}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5BA4CF' }} />
              <input
                type={verPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); limpiarError() }}
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{ backgroundColor: '#fff', border: '1px solid #D6E8F5' }}
                onFocus={e => e.target.style.borderColor = '#5BA4CF'}
                onBlur={e => e.target.style.borderColor = '#D6E8F5'}
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#5BA4CF' }}
              >
                {verPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-xs font-medium px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full text-white font-black text-sm py-3.5 rounded-xl transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1A5C8A' }}
              onMouseEnter={e => { if (!cargando) e.currentTarget.style.backgroundColor = '#144A72' }}
              onMouseLeave={e => { if (!cargando) e.currentTarget.style.backgroundColor = '#1A5C8A' }}
            >
              {cargando ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>

          {/* Cambiar modo */}
          <p className="text-center text-xs text-neutral-500 mt-5">
            {modo === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
            <button
              onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); limpiarError() }}
              className="font-bold hover:underline"
              style={{ color: '#1A5C8A' }}
            >
              {modo === 'login' ? 'Registrate gratis' : 'Iniciá sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModalLogin