import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { mensajeError, olvideContrasena, restablecerContrasena } from '@/auth/cognitoApi'
import { AuthAlert, AuthCard, AYUDA_CONTRASENA, contrasenaValida } from '@/components/auth/AuthCard'

/** F27 · Olvidé mi contraseña: Cognito envía un código al correo y con él se define una nueva. */
export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [paso, setPaso] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [codigo, setCodigo] = useState('')
  const [nueva, setNueva] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pedirCodigo(evento: FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await olvideContrasena(email.trim().toLowerCase())
      setPaso('codigo')
    } catch (causa) {
      setError(mensajeError(causa))
    } finally {
      setEnviando(false)
    }
  }

  async function cambiar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    if (!contrasenaValida(nueva)) return setError(AYUDA_CONTRASENA)
    setEnviando(true)
    try {
      const correo = email.trim().toLowerCase()
      await restablecerContrasena(correo, codigo.trim(), nueva)
      navigate(`/ingresar?aviso=contrasena&email=${encodeURIComponent(correo)}`, { replace: true })
    } catch (causa) {
      setError(mensajeError(causa))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthCard
      eyebrow="Mi cuenta"
      title="Recupera tu contraseña"
      footer={<Link to="/ingresar">Volver a iniciar sesión</Link>}
    >
      {paso === 'codigo' ? (
        <AuthAlert tone="info">Si existe una cuenta con {email.trim()}, te enviamos un código para cambiar la contraseña.</AuthAlert>
      ) : null}
      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

      {paso === 'email' ? (
        <form className="auth-form" onSubmit={pedirCodigo}>
          <label>
            <span>Email de tu cuenta</span>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviarme un código'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={cambiar}>
          <label>
            <span>Código</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </label>
          <label>
            <span>Contraseña nueva</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
            />
            <small className="auth-hint">{AYUDA_CONTRASENA}</small>
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
