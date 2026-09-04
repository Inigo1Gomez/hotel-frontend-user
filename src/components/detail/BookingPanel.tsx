import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Guests, Hotel, RoomOption } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { IS_DEMO_MODE } from '@/api/client'
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

/**
 * Resumen y datos de contacto previos a la reserva.
 *
 * El envio real corresponde al microservicio de reservas; aqui se valida el
 * formulario y se muestra la confirmacion que devolveria ese servicio.
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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

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

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
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

          {sent ? (
            <div className="booking-done">
              <span className="card-icon is-green">
                <Icon name="check" size={24} />
              </span>
              <h2>Solicitud registrada</h2>
              <p>
                Guardamos tu solicitud para <strong>{room.name}</strong> en {hotel.name}, del{' '}
                {formatLongDate(checkIn)} al {formatLongDate(checkOut)}.
              </p>
              {IS_DEMO_MODE && (
                <p className="demo-note">
                  <Icon name="sparkles" size={16} />
                  <span>
                    Modo demo: la reserva no se envió a ningún servidor. Al conectar el microservicio
                    de reservas, este formulario hará <code>POST /reservas</code>.
                  </span>
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
                <label>
                  <span>Nombre y apellido</span>
                  <input
                    type="text"
                    value={name}
                    required
                    autoComplete="name"
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
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
                <button type="submit" className="btn btn-primary btn-block">
                  Confirmar solicitud
                </button>
                <p className="booking-fineprint">
                  {room.refundable
                    ? 'Puedes cancelar sin costo hasta 48 h antes del check-in.'
                    : 'Tarifa no reembolsable: no admite cancelación ni cambios.'}
                </p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
