import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '@/api/client'
import {
  IS_BOOKING_DEMO,
  cancelarReserva,
  misReservas,
  sePuedeCancelar,
  type Reserva,
} from '@/api/bookings'
import { useAuth } from '@/auth/AuthContext'
import { AuthAlert } from '@/components/auth/AuthCard'
import { ReservaItem } from '@/components/reservas/ReservaItem'

function mensajeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Tu sesión venció. Vuelve a iniciar sesión.'
    if (error.status === 403) return 'Tu cuenta no tiene el rol Cliente todavía. Cierra sesión y vuelve a entrar.'
    if (error.status === 404) return 'Esa reserva ya no existe o no es tuya.'
    if (error.code === 'TRANSICION_INVALIDA') return 'Esa reserva ya no se puede cancelar.'
  }
  return 'No pudimos conectar con el servicio de reservas. Intenta de nuevo en unos minutos.'
}

/**
 * "Mis reservas" del huésped con cuenta (Cognito, rol Cliente).
 * El backend devuelve solo las reservas del `sub` del token, y lo único que permite es cancelar una propia.
 */
export function MisReservasPage() {
  const { huesped, accessToken } = useAuth()
  const [reservas, setReservas] = useState<Reserva[] | null>(null)
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const cargar = useCallback(
    async (numero: number) => {
      setCargando(true)
      setError(null)
      try {
        const token = await accessToken()
        if (!token) throw new ApiError('Sin sesión', 401)
        const respuesta = await misReservas(token, numero)
        setReservas(respuesta.data)
        setTotal(respuesta.total)
        setPagina(respuesta.pagina)
      } catch (causa) {
        setError(mensajeError(causa))
      } finally {
        setCargando(false)
      }
    },
    [accessToken],
  )

  useEffect(() => {
    if (huesped && !IS_BOOKING_DEMO) void cargar(1)
  }, [huesped?.sub, cargar])

  if (!huesped) return <Navigate to="/ingresar?volver=/mis-reservas" replace />

  async function cancelar(reserva: Reserva) {
    if (!window.confirm(`¿Cancelar la reserva ${reserva.codigo}? No se puede deshacer.`)) return
    setCancelando(reserva.codigo)
    setError(null)
    setAviso(null)
    try {
      const token = await accessToken()
      if (!token) throw new ApiError('Sin sesión', 401)
      const cancelada = await cancelarReserva(token, reserva.codigo)
      setReservas((actuales) => actuales?.map((r) => (r.codigo === cancelada.codigo ? cancelada : r)) ?? null)
      setAviso(`La reserva ${cancelada.codigo} quedó cancelada. Te enviamos un correo con el cambio.`)
    } catch (causa) {
      setError(mensajeError(causa))
    } finally {
      setCancelando(null)
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(total / 10))

  return (
    <section className="section auth-section">
      <div className="container auth-container is-wide">
        <div className="auth-card">
          <span className="eyebrow">Mi cuenta</span>
          <h1 className="auth-title">Mis reservas</h1>
          <p className="auth-lede">Las reservas que hiciste con la cuenta {huesped.email}.</p>

          {IS_BOOKING_DEMO ? (
            <AuthAlert tone="info">El sitio está en modo demo: no hay backend de reservas configurado.</AuthAlert>
          ) : null}
          {aviso ? <AuthAlert tone="ok">{aviso}</AuthAlert> : null}
          {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

          {cargando && !reservas ? <p className="auth-hint">Cargando tus reservas…</p> : null}

          {reservas && reservas.length === 0 ? (
            <p className="reserva-vacia">
              Todavía no tienes reservas con tu cuenta. <Link to="/hoteles">Busca un alojamiento</Link>.
            </p>
          ) : null}

          {reservas && reservas.length > 0 ? (
            <div className="reserva-lista">
              {reservas.map((reserva) => (
                <ReservaItem key={reserva.codigo} {...reserva}>
                  {sePuedeCancelar(reserva.estado) ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={cancelando !== null}
                      onClick={() => void cancelar(reserva)}
                    >
                      {cancelando === reserva.codigo ? 'Cancelando…' : 'Cancelar reserva'}
                    </button>
                  ) : null}
                </ReservaItem>
              ))}
            </div>
          ) : null}

          {totalPaginas > 1 ? (
            <div className="reserva-paginas">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={pagina <= 1 || cargando}
                onClick={() => void cargar(pagina - 1)}
              >
                Anterior
              </button>
              <span>
                Página {pagina} de {totalPaginas}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={pagina >= totalPaginas || cargando}
                onClick={() => void cargar(pagina + 1)}
              >
                Siguiente
              </button>
            </div>
          ) : null}

          <div className="auth-footer">
            ¿Reservaste sin cuenta? <Link to="/reserva">Consulta con tu código</Link>.
          </div>
        </div>
      </div>
    </section>
  )
}
