import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { probarRuta, type ResultadoRuta } from '@/api/cliente'
import { IS_BOOKING_DEMO } from '@/api/bookings'
import { useAuth } from '@/auth/AuthContext'
import { leerClaims } from '@/auth/jwt'
import { AuthAlert } from '@/components/auth/AuthCard'

/** Ruta de cliente (Cognito) y ruta de Admin/Operador (Entra ID): la primera debe abrir y la segunda no. */
const PRUEBAS = [
  { ruta: '/api/v1/cliente/reservas', titulo: 'Mis reservas (cliente)', esperado: 'permitida' },
  { ruta: '/api/v1/reservas', titulo: 'Todas las reservas (Admin / Operador)', esperado: 'bloqueada' },
] as const

function formatoHora(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export function AccountPage() {
  const { huesped, tokens, accessToken, salir } = useAuth()
  const navigate = useNavigate()
  const [resultados, setResultados] = useState<ResultadoRuta[] | null>(null)
  const [probando, setProbando] = useState(false)

  if (!huesped || !tokens) return <Navigate to="/ingresar?volver=/cuenta" replace />

  const claims = leerClaims(tokens.accessToken)

  async function probar() {
    setProbando(true)
    const token = await accessToken()
    if (!token) {
      navigate('/ingresar?volver=/cuenta')
      return
    }
    setResultados(await Promise.all(PRUEBAS.map((prueba) => probarRuta(prueba.ruta, token))))
    setProbando(false)
  }

  async function cerrarSesion() {
    await salir()
    navigate('/', { replace: true })
  }

  return (
    <section className="section auth-section">
      <div className="container auth-container is-wide">
        <div className="auth-card">
          <span className="eyebrow">Mi cuenta</span>
          <h1 className="auth-title">Hola, {huesped.nombre}</h1>
          <p className="auth-lede">{huesped.email}</p>
          <p>
            <Link to="/mis-reservas" className="btn btn-primary btn-sm">
              Ver mis reservas
            </Link>
          </p>

          <dl className="auth-claims">
            <dt>Rol</dt>
            <dd>{huesped.grupos.length ? huesped.grupos.join(', ') : 'sin grupo asignado'}</dd>
            <dt>Id (sub)</dt>
            <dd>
              <code>{huesped.sub}</code>
            </dd>
            <dt>Emisor</dt>
            <dd>
              <code>{String(claims.iss ?? '')}</code>
            </dd>
            <dt>Sesión vence</dt>
            <dd>{formatoHora(tokens.expiraEn)} (se renueva sola con el refresh token)</dd>
          </dl>

          <h2 className="auth-subtitle">Comprobar acceso con tu token</h2>
          {IS_BOOKING_DEMO ? (
            <AuthAlert tone="info">El sitio está en modo demo: no hay backend configurado para probar.</AuthAlert>
          ) : (
            <>
              <button type="button" className="btn btn-outline btn-sm" onClick={probar} disabled={probando}>
                {probando ? 'Probando…' : 'Probar rutas'}
              </button>
              {resultados ? (
                <ul className="auth-checks">
                  {PRUEBAS.map((prueba, indice) => {
                    const resultado = resultados[indice]!
                    const permitida = resultado.status >= 200 && resultado.status < 300
                    const correcto = (prueba.esperado === 'permitida') === permitida
                    return (
                      <li key={prueba.ruta} className={correcto ? 'is-ok' : 'is-error'}>
                        <strong>{prueba.titulo}</strong>
                        <span>
                          <code>GET {prueba.ruta}</code> → {resultado.status || 'sin respuesta'}
                          {resultado.detalle ? ` (${resultado.detalle})` : ''} · {permitida ? 'permitida' : 'bloqueada'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </>
          )}

          <div className="auth-footer">
            <button type="button" className="btn btn-ghost" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
