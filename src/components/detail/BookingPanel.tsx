import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Guests, Hotel, RoomOption } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { ApiError } from '@/api/client'
import { IS_BOOKING_DEMO, createBooking } from '@/api/bookings'
import type { ReservaPayload } from '@/api/bookings'
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
    return error.status === 400
      ? 'El servicio de reservas rechazó los datos. Revisa el formulario e intenta de nuevo.'
      : `El servicio de reservas no está disponible (HTTP ${error.status}). Intenta de nuevo en unos minutos.`
  }
  return 'No pudimos conectar con el servicio de reservas. Revisa tu conexión e intenta de nuevo.'
}

/**
 * Resumen, datos del huesped y envio de la reserva a hotel-ms-reservas.
 *
 * Al aceptarla, el microservicio publica `reserva.creada` en RabbitMQ y
 * hotel-ms-notificaciones envia el comprobante en PDF al correo del huesped.
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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<ReservaPayload | null>(null)

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
      const created = await createBooking({
        hotel,
        room,
        checkIn,
        checkOut,
        guests,
        total,
        guest: { firstName, lastName, email, phone },
      })
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
              <h2>Reserva confirmada</h2>
              <p>
                Tu código es <strong>{booking.codigo}</strong>. Reservaste{' '}
                <strong>{room.name}</strong> en {hotel.name}, del {formatLongDate(checkIn)} al{' '}
                {formatLongDate(checkOut)}.
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
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Entendido
              </button>
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
                  {sending ? 'Enviando reserva…' : 'Confirmar reserva'}
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
