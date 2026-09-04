import { useEffect, useRef, useState } from 'react'
import type { Guests } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { guestsLabel } from '@/lib/format'

interface StepperProps {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function Stepper({ label, hint, value, min, max, onChange }: StepperProps) {
  return (
    <div className="stepper">
      <div className="stepper-copy">
        <span className="stepper-label">{label}</span>
        {hint && <span className="stepper-hint">{hint}</span>}
      </div>
      <div className="stepper-controls">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Quitar un ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="stepper-value" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Agregar un ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

interface GuestsFieldProps {
  value: Guests
  onChange: (guests: Guests) => void
}

/** Selector de huespedes en popover, con cierre por clic fuera y Escape. */
export function GuestsField({ value, onChange }: GuestsFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const summary = guestsLabel(value.adults, value.children, value.rooms)

  return (
    <div className="search-field is-guests" ref={containerRef}>
      <span className="search-field-label" id="guests-label">
        Huéspedes
      </span>
      <button
        type="button"
        className="search-field-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby="guests-label"
      >
        <Icon name="users" size={18} />
        <span className="search-field-value">{summary}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>

      {open && (
        <div className="guests-popover" role="dialog" aria-label="Seleccionar huéspedes">
          <Stepper
            label="Adultos"
            hint="Desde 13 años"
            value={value.adults}
            min={1}
            max={12}
            onChange={(adults) => onChange({ ...value, adults })}
          />
          <Stepper
            label="Niños"
            hint="De 0 a 12 años"
            value={value.children}
            min={0}
            max={8}
            onChange={(children) => onChange({ ...value, children })}
          />
          <Stepper
            label="Habitaciones"
            value={value.rooms}
            min={1}
            max={6}
            onChange={(rooms) => onChange({ ...value, rooms })}
          />
          <button type="button" className="btn btn-outline btn-sm btn-block" onClick={() => setOpen(false)}>
            Listo
          </button>
        </div>
      )}
    </div>
  )
}
