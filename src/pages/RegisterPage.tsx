import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmarRegistro, mensajeError, reenviarCodigo, registrar } from '@/auth/cognitoApi'
import { AuthAlert, AuthCard, AYUDA_CONTRASENA, contrasenaValida } from '@/components/auth/AuthCard'

/**
 * F24 · Auto-registro en el User Pool: datos → código que llega al correo → cuenta confirmada.
 * Al confirmar, la Lambda post-confirmación agrega al huésped al grupo CLIENTE (F26).
 */
export function RegisterPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [paso, setPaso] = useState<'datos' | 'codigo'>(params.get('paso') === 'confirmar' ? 'codigo' : 'datos')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [repetir, setRepetir] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function crearCuenta(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    if (!contrasenaValida(password)) return setError(AYUDA_CONTRASENA)
    if (password !== repetir) return setError('Las contraseñas no coinciden.')
    setEnviando(true)
    try {
      await registrar(email.trim().toLowerCase(), password, nombre.trim())
      setAviso(`Te enviamos un código a ${email.trim()}. Escríbelo para confirmar tu cuenta.`)
      setPaso('codigo')
    } catch (causa) {
      setError(mensajeError(causa))
    } finally {
      setEnviando(false)
    }
  }

  async function confirmar(evento: FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const correo = email.trim().toLowerCase()
      await confirmarRegistro(correo, codigo.trim())
      navigate(`/ingresar?aviso=confirmada&email=${encodeURIComponent(correo)}`, { replace: true })
    } catch (causa) {
      setError(mensajeError(causa))
    } finally {
      setEnviando(false)
    }
  }

  async function reenviar() {
    setError(null)
    try {
      await reenviarCodigo(email.trim().toLowerCase())
      setAviso('Te enviamos un código nuevo.')
    } catch (causa) {
      setError(mensajeError(causa))
    }
  }

  return (
    <AuthCard
      eyebrow="Mi cuenta"
      title={paso === 'datos' ? 'Crea tu cuenta' : 'Confirma tu email'}
      lede={paso === 'datos' ? 'Gratis y en un minuto. Con ella sigues tus reservas desde cualquier dispositivo.' : undefined}
      footer={
        <>
          ¿Ya tienes cuenta? <Link to="/ingresar">Inicia sesión</Link>
        </>
      }
    >
      {aviso ? <AuthAlert tone="info">{aviso}</AuthAlert> : null}
      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

      {paso === 'datos' ? (
        <form className="auth-form" onSubmit={crearCuenta}>
          <label>
            <span>Nombre</span>
            <input autoComplete="name" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span>Contraseña</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small className="auth-hint">{AYUDA_CONTRASENA}</small>
          </label>
          <label>
            <span>Repite la contraseña</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={confirmar}>
          <label>
            <span>Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span>Código de confirmación</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? 'Confirmando…' : 'Confirmar cuenta'}
          </button>
          <button type="button" className="auth-link" onClick={reenviar} disabled={!email}>
            No me llegó el código: reenviar
          </button>
        </form>
      )}
    </AuthCard>
  )
}
