import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { IS_BOOKING_DEMO, consultarReserva, type ReservaPublica } from '@/api/bookings'
import { AuthAlert } from '@/components/auth/AuthCard'
import { ReservaItem } from '@/components/reservas/ReservaItem'

function mensajeConsulta(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return 'No encontramos una reserva con ese código y email. Revisa los datos del correo de confirmación.'
  }
  if (error instanceof ApiError && error.status === 400) return 'Ingresa el código y el email de la reserva.'
  return 'No pudimos conectar con el servicio de reservas. Intenta de nuevo en unos minutos.'
}

/**
 * Consulta pública (sin cuenta): con el código y el email de la reserva se ve su estado.
 * El backend pide los dos datos y no devuelve datos de contacto, así nadie puede ver reservas ajenas.
 */
export function ConsultaReservaPage() {
  const [params, setParams] = useSearchParams()
  // El email llega en el estado de la navegación (no en la URL) desde el aviso de "Reserva recibida".
  const emailInicial = (useLocation().state as { email?: string } | null)?.email ?? ''
  const [codigo, setCodigo] = useState(params.get('codigo') ?? '')
  const [email, setEmail] = useState(emailInicial)
  const [reserva, setReserva] = useState<ReservaPublica | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buscar(codigoBuscado: string, emailBuscado: string) {
    setBuscando(true)
    setError(null)
    setReserva(null)
    try {
      setReserva(await consultarReserva(codigoBuscado, emailBuscado))
    } catch (causa) {
      setError(mensajeConsulta(causa))
    } finally {
      setBuscando(false)
    }
  }

  // Desde el aviso de "Reserva recibida" se llega con los dos datos: se consulta de inmediato (solo al entrar).
  useEffect(() => {
    if (codigo && emailInicial && !IS_BOOKING_DEMO) void buscar(codigo, emailInicial)
  }, [])

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    // El email no va a la URL: solo el código, así el enlace no expone datos personales.
    setParams({ codigo: codigo.trim().toUpperCase() }, { replace: true })
    void buscar(codigo, email)
  }

  return (
    <section className="section auth-section">
      <div className="container auth-container is-wide">
        <div className="auth-card">
          <span className="eyebrow">Mi reserva</span>
          <h1 className="auth-title">Consultar una reserva</h1>
          <p className="auth-lede">Ingresa el código que te dimos al reservar y el email con que la hiciste.</p>

          {IS_BOOKING_DEMO ? (
            <AuthAlert tone="info">El sitio está en modo demo: no hay backend de reservas para consultar.</AuthAlert>
          ) : (
            <form className="auth-form reserva-busqueda" onSubmit={enviar}>
              <label>
                <span>Código</span>
                <input
                  value={codigo}
                  required
                  placeholder="RES-XXXXXXXX"
                  autoCapitalize="characters"
                  onChange={(evento) => setCodigo(evento.target.value)}
                />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={email} required autoComplete="email" onChange={(evento) => setEmail(evento.target.value)} />
              </label>
              <button type="submit" className="btn btn-primary" disabled={buscando}>
                {buscando ? 'Buscando…' : 'Consultar'}
              </button>
            </form>
          )}

          <div className="reserva-resultado" aria-live="polite">
            {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
            {reserva ? (
              <>
                <p className="reserva-saludo">Hola, {reserva.huesped.nombre}. Esta es tu reserva:</p>
                <ReservaItem {...reserva} />
              </>
            ) : null}
          </div>

          <div className="auth-footer">
            ¿Tienes cuenta? <Link to="/mis-reservas">Ve todas tus reservas</Link> y cancélalas desde ahí.
          </div>
        </div>
      </div>
    </section>
  )
}
