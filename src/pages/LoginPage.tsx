import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CognitoError, mensajeError } from '@/auth/cognitoApi'
import { useAuth } from '@/auth/AuthContext'
import { AuthAlert, AuthCard } from '@/components/auth/AuthCard'

/** F25 · Login de huésped con su cuenta de Cognito. */
export function LoginPage() {
  const { ingresar } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const aviso = params.get('aviso')
  const volver = params.get('volver') ?? '/cuenta'

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await ingresar(email, password)
      // Solo rutas internas de la app: nunca se redirige a otro sitio.
      navigate(volver.startsWith('/') && !volver.startsWith('//') ? volver : '/cuenta', { replace: true })
    } catch (causa) {
      if (causa instanceof CognitoError && causa.code === 'UserNotConfirmedException') {
        navigate(`/registro?paso=confirmar&email=${encodeURIComponent(email.trim().toLowerCase())}`)
        return
      }
      setError(mensajeError(causa))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthCard
      eyebrow="Mi cuenta"
      title="Inicia sesión"
      lede="Con tu cuenta ves tus reservas y puedes cancelarlas. Para reservar no es obligatoria."
      footer={
        <>
          ¿No tienes cuenta? <Link to="/registro">Crea una</Link>
        </>
      }
    >
      {aviso === 'confirmada' ? <AuthAlert tone="ok">Cuenta confirmada. Ya puedes iniciar sesión.</AuthAlert> : null}
      {aviso === 'contrasena' ? <AuthAlert tone="ok">Contraseña cambiada. Inicia sesión con la nueva.</AuthAlert> : null}
      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

      <form className="auth-form" onSubmit={enviar}>
        <label>
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
        <Link to={`/recuperar${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="auth-link">
          Olvidé mi contraseña
        </Link>
      </form>
    </AuthCard>
  )
}
