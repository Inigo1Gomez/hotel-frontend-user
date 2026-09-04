import { useEffect, useId, useState } from 'react'
import type { Guests, SearchCriteria } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { GuestsField } from './GuestsField'
import { DESTINATIONS } from '@/data/hotels'
import { addDays, nightsBetween, pluralize, toISODate } from '@/lib/format'

interface SearchBarProps {
  value: SearchCriteria
  onSubmit: (criteria: SearchCriteria) => void
  /** `hero` para la portada, `compact` para la barra de resultados. */
  variant?: 'hero' | 'compact'
  submitLabel?: string
}

/**
 * Control de busqueda: destino, fechas y huespedes.
 * Mantiene estado propio y solo notifica al enviar, para no relanzar
 * la busqueda con cada tecla.
 */
export function SearchBar({ value, onSubmit, variant = 'hero', submitLabel = 'Buscar' }: SearchBarProps) {
  const [draft, setDraft] = useState<SearchCriteria>(value)
  const listId = useId()
  const today = toISODate(new Date())

  // Si la busqueda cambia desde fuera (navegacion, URL compartida), se refleja aqui.
  useEffect(() => setDraft(value), [value])

  const setCheckIn = (checkIn: string) => {
    setDraft((prev) => ({
      ...prev,
      checkIn,
      checkOut: prev.checkOut <= checkIn ? addDays(checkIn, 1) : prev.checkOut,
    }))
  }

  const setGuests = (guests: Guests) => setDraft((prev) => ({ ...prev, guests }))

  const nights = nightsBetween(draft.checkIn, draft.checkOut)

  return (
    <form
      className={`search-bar is-${variant}`}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(draft)
      }}
      role="search"
    >
      <div className="search-field is-destination">
        <label className="search-field-label" htmlFor={`${listId}-dest`}>
          Destino
        </label>
        <div className="search-field-control">
          <Icon name="pin" size={18} />
          <input
            id={`${listId}-dest`}
            list={listId}
            type="text"
            value={draft.destination}
            placeholder="¿A qué cerro vas?"
            onChange={(event) => setDraft({ ...draft, destination: event.target.value })}
            autoComplete="off"
          />
          <datalist id={listId}>
            {DESTINATIONS.map((destination) => (
              <option key={destination} value={destination} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="search-field is-date">
        <label className="search-field-label" htmlFor={`${listId}-in`}>
          Entrada
        </label>
        <div className="search-field-control">
          <Icon name="calendar" size={18} />
          <input
            id={`${listId}-in`}
            type="date"
            value={draft.checkIn}
            min={today}
            onChange={(event) => setCheckIn(event.target.value)}
          />
        </div>
      </div>

      <div className="search-field is-date">
        <label className="search-field-label" htmlFor={`${listId}-out`}>
          Salida
        </label>
        <div className="search-field-control">
          <Icon name="calendar" size={18} />
          <input
            id={`${listId}-out`}
            type="date"
            value={draft.checkOut}
            min={addDays(draft.checkIn, 1)}
            onChange={(event) => setDraft({ ...draft, checkOut: event.target.value })}
          />
        </div>
      </div>

      <GuestsField value={draft.guests} onChange={setGuests} />

      <button type="submit" className="btn btn-primary search-submit">
        <Icon name="search" size={18} />
        {submitLabel}
      </button>

      <p className="search-nights" aria-live="polite">
        {nights} {pluralize(nights, 'noche', 'noches')}
      </p>
    </form>
  )
}
