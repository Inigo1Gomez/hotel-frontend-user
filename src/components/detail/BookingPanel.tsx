import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Guests, Hotel, RoomOption } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { ApiError } from '@/api/client'
import { ESTADO_TEXTO, IS_BOOKING_DEMO, createBooking } from '@/api/bookings'
import type { Reserva } from '@/api/bookings'
import { useAuth } from '@/auth/AuthContext'
import { COGNITO_ENABLED } from '@/auth/cognitoApi'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { formatLongDate, formatPrice, guestsLabel, pluralize } from '@/lib/format'

interface BookingPanelProps {
  hotel: Hotel
  room: RoomOption
  checkIn: string
  checkOut: string
  guests: Guests
  nights: number
  onClose: () => void
}

function bookingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return 'Tu sesión venció o no tiene el rol Cliente. Vuelve a iniciar sesión e intenta de nuevo.'
    }
    return error.status === 400
      ? 'El servicio de reservas rechazó los datos. Revisa el formulario e intenta de nuevo.'
      : `El servicio de reservas no está disponible (HTTP ${error.status}). Intenta de nuevo en unos minutos.`
  }
  return 'No pudimos conectar con el servicio de reservas. Revisa tu conexión e intenta de nuevo.'
}

/**
 * Resumen, datos del huesped y envio de la reserva a hotel-ms-reservas.
 *
 * Sin sesion se reserva como invitado (ruta publica). Con sesion de Cognito se reserva con cuenta:
 * queda a nombre del huesped y aparece en "Mis reservas". En ambos casos parte en PENDIENTE,
 * el microservicio publica el evento y hotel-ms-notificaciones envia el comprobante en PDF.
 */
export function BookingPanel({
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  nights,
  onClose,
}: BookingPanelProps) {
  const { huesped, accessToken } = useAuth()
  // Con cuenta se precargan nombre y email del token (el email es el de la cuenta y no se edita).
  const [nombreCuenta = '', ...apellidosCuenta] = huesped?.nombre.split(' ') ?? []
  const [firstName, setFirstName] = useState(nombreCuenta)
  const [lastName, setLastName] = useState(apellidosCuenta.join(' '))
  const [email, setEmail] = useState(huesped?.email ?? '')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<Reserva | null>(null)

  useLockBodyScroll(true)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const subtotal = room.pricePerNight * nights
  const serviceFee = Math.round(subtotal * 0.04)
  const total = subtotal + serviceFee

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSending(true)
    setError(null)
    try {
      const token = huesped ? await accessToken() : null
      if (huesped && !token) {
        setError('Tu sesión venció. Vuelve a iniciar sesión para reservar con tu cuenta.')
        return
      }
      const created = await createBooking({
        hotel,
        room,
        checkIn,
        checkOut,
        guests,
        total,
        guest: { firstName, lastName, email, phone },
      }, token)
      setBooking(created)
    } catch (err) {
      setError(bookingErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="booking-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="booking-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Reservar en ${hotel.name}`}
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          onClick={(event) => event.stopPropagation()}
        >
          <button type="button" className="booking-close" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>

          {booking ? (
            <div className="booking-done">
              <span className="card-icon is-green">
                <Icon name="check" size={24} />
              </span>
              <h2>Reserva recibida</h2>
              <p>
                Tu código es <strong>{booking.codigo}</strong>. Reservaste{' '}
                <strong>{room.name}</strong> en {hotel.name}, del {formatLongDate(checkIn)} al{' '}
                {formatLongDate(checkOut)}.
              </p>
              <p>
                Estado: <strong>{ESTADO_TEXTO[booking.estado]}</strong>. El hotel la confirma y te avisamos por
                correo.
              </p>
              {IS_BOOKING_DEMO ? (
                <p className="demo-note">
                  <Icon name="sparkles" size={16} />
                  <span>
                    Modo demo: la reserva no se envió a ningún servidor. Define{' '}
                    <code>VITE_RESERVAS_URL</code> para enviarla a hotel-ms-reservas y recibir el
                    comprobante por correo.
                  </span>
                </p>
              ) : (
                <p>
                  En unos instantes te llegará a <strong>{booking.huesped.email}</strong> el
                  comprobante en PDF.
                </p>
              )}
              <div className="booking-done-actions">
                {huesped ? (
                  <Link to="/mis-reservas" className="btn btn-outline">
                    Ver mis reservas
                  </Link>
                ) : (
                  <Link
                    to={`/reserva?codigo=${encodeURIComponent(booking.codigo)}`}
                    state={{ email: booking.huesped.email }}
                    className="btn btn-outline"
                  >
                    Consultar mi reserva
                  </Link>
                )}
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Entendido
                </button>
              </div>
            </div>
          ) : (
            <>
              <header className="booking-head">
                <span className="eyebrow">Resumen</span>
                <h2>{hotel.name}</h2>
                <p>{room.name}</p>
              </header>

              <dl className="booking-summary">
                <div>
                  <dt>Entrada</dt>
                  <dd>{formatLongDate(checkIn)}</dd>
                </div>
                <div>
                  <dt>Salida</dt>
                  <dd>{formatLongDate(checkOut)}</dd>
                </div>
                <div>
                  <dt>Huéspedes</dt>
                  <dd>{guestsLabel(guests.adults, guests.children, guests.rooms)}</dd>
                </div>
              </dl>

              <ul className="booking-lines">
                <li>
                  <span>
                    {formatPrice(room.pricePerNight)} × {nights}{' '}
                    {pluralize(nights, 'noche', 'noches')}
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </li>
                <li>
                  <span>Cargo por servicio</span>
                  <span>{formatPrice(serviceFee)}</span>
                </li>
                <li className="is-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </li>
              </ul>

              <form className="booking-form" onSubmit={submit}>
                <p className="booking-mode">
                  {huesped ? (
                    <>
                      Reservas con tu cuenta <strong>{huesped.email}</strong>: quedará en{' '}
                      <Link to="/mis-reservas">Mis reservas</Link>.
                    </>
                  ) : (
                    <>
                      Reservas como invitado: guarda el código que te daremos.
                      {COGNITO_ENABLED ? (
                        <>
                          {' '}
                          <Link to="/ingresar">Inicia sesión</Link> para verla en Mis reservas.
                        </>
                      ) : null}
                    </>
                  )}
                </p>
                <div className="booking-form-row">
                  <label>
                    <span>Nombre</span>
                    <input
                      type="text"
                      value={firstName}
                      required
                      autoComplete="given-name"
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Apellido</span>
                    <input
                      type="text"
                      value={lastName}
                      required
                      autoComplete="family-name"
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </label>
                </div>
                <label>
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    value={email}
                    required
                    readOnly={Boolean(huesped)}
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label>
                  <span>Teléfono (opcional)</span>
                  <input
                    type="tel"
                    value={phone}
                    autoComplete="tel"
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
                {error && (
                  <p className="booking-error" role="alert">
                    {error}
                  </p>
                )}
                <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
                  {sending ? 'Enviando reserva…' : 'Enviar reserva'}
                </button>
                <p className="booking-fineprint">
                  {room.refundable
                    ? 'Puedes cancelar sin costo hasta 48 h antes del check-in.'
                    : 'Tarifa no reembolsable: no admite cancelación ni cambios.'}{' '}
                  Te enviaremos el comprobante por correo.
                </p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
