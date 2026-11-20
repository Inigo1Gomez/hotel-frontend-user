import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ESTADO_TEXTO, type EstadoReserva } from '@/api/bookings'
import { buscarHabitacion } from '@/api/catalogo'
import { formatLongDate, formatPrice, nightsBetween, pluralize } from '@/lib/format'

interface ReservaItemProps {
  codigo: string
  estado: EstadoReserva
  idHabitacion: string
  fechaEntrada: string
  fechaSalida: string
  cantidadHuespedes: number
  precioTotal: number
  /** Acciones de la tarjeta (p. ej. cancelar en "Mis reservas"). */
  children?: ReactNode
}

/** El backend devuelve fechas ISO completas; la web muestra solo el día. */
function dia(iso: string): string {
  return iso.slice(0, 10)
}

/** Una reserva: código, estado, hotel y habitación (buscados en el catálogo), fechas y total. */
export function ReservaItem(props: ReservaItemProps) {
  const [lugar, setLugar] = useState<{ hotel: string; habitacion: string; slug: string } | null>(null)

  useEffect(() => {
    let vigente = true
    buscarHabitacion(props.idHabitacion).then((encontrada) => {
      if (vigente && encontrada) {
        setLugar({ hotel: encontrada.hotel.name, habitacion: encontrada.room.name, slug: encontrada.hotel.slug })
      }
    })
    return () => {
      vigente = false
    }
  }, [props.idHabitacion])

  const entrada = dia(props.fechaEntrada)
  const salida = dia(props.fechaSalida)
  const noches = nightsBetween(entrada, salida)

  return (
    <article className="reserva-item">
      <header className="reserva-item-head">
        <code className="reserva-codigo">{props.codigo}</code>
        <span className={`reserva-estado is-${props.estado.toLowerCase()}`}>{ESTADO_TEXTO[props.estado]}</span>
      </header>
      <h3 className="reserva-lugar">
        {lugar ? <Link to={`/hotel/${lugar.slug}`}>{lugar.hotel}</Link> : `Habitación ${props.idHabitacion}`}
      </h3>
      {lugar ? <p className="reserva-habitacion">{lugar.habitacion}</p> : null}
      <dl className="reserva-datos">
        <div>
          <dt>Entrada</dt>
          <dd>{formatLongDate(entrada)}</dd>
        </div>
        <div>
          <dt>Salida</dt>
          <dd>
            {formatLongDate(salida)} · {noches} {pluralize(noches, 'noche', 'noches')}
          </dd>
        </div>
        <div>
          <dt>Huéspedes</dt>
          <dd>{props.cantidadHuespedes}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatPrice(props.precioTotal)}</dd>
        </div>
      </dl>
      {props.children ? <div className="reserva-acciones">{props.children}</div> : null}
    </article>
  )
}
