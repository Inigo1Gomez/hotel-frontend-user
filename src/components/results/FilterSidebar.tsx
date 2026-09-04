import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AmenityId, HotelFilters, Neighborhood, PropertyType } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { AMENITIES } from '@/data/amenities'
import { NEIGHBORHOODS } from '@/data/neighborhoods'
import { PRICE_BOUNDS } from '@/data/hotels'
import { RATING_OPTIONS, countActiveFilters, defaultFilters } from '@/lib/filters'
import { PROPERTY_TYPES } from '@/lib/searchParams'
import { formatPrice } from '@/lib/format'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

interface FilterSidebarProps {
  filters: HotelFilters
  onChange: (filters: HotelFilters) => void
  /** Cuántos alojamientos quedan con los filtros actuales. */
  resultCount: number
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item]
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="filter-group">
      <h3 className="filter-group-title">{title}</h3>
      {children}
    </section>
  )
}

export function FilterSidebar({ filters, onChange, resultCount }: FilterSidebarProps) {
  const id = useId()
  const activeCount = countActiveFilters(filters)
  const patch = (next: Partial<HotelFilters>) => onChange({ ...filters, ...next })

  // El texto se escribe en local y se propaga cuando el usuario deja de teclear:
  // cada cambio de filtro reescribe la URL y relanza la busqueda.
  const [queryDraft, setQueryDraft] = useState(filters.query)
  const debouncedQuery = useDebouncedValue(queryDraft, 350)
  const latest = useRef({ filters, onChange })

  useEffect(() => {
    latest.current = { filters, onChange }
  })

  useEffect(() => {
    const { filters: current, onChange: emit } = latest.current
    if (debouncedQuery !== current.query) emit({ ...current, query: debouncedQuery })
  }, [debouncedQuery])

  // Resincroniza si los filtros se limpian o llegan desde la URL.
  useEffect(() => {
    setQueryDraft(filters.query)
  }, [filters.query])

  return (
    <div className="filters">
      <header className="filters-head">
        <h2 className="filters-title">
          <Icon name="sliders" size={18} />
          Filtros
        </h2>
        {activeCount > 0 && (
          <button type="button" className="filters-clear" onClick={() => onChange(defaultFilters())}>
            Limpiar ({activeCount})
          </button>
        )}
      </header>

      <p className="filters-count">
        <strong>{resultCount}</strong> alojamientos coinciden
      </p>

      <FilterGroup title="Nombre del alojamiento">
        <div className="filter-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={queryDraft}
            placeholder="Buscar por nombre"
            onChange={(event) => setQueryDraft(event.target.value)}
            aria-label="Buscar por nombre del alojamiento"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Precio por noche">
        <div className="price-range">
          <output className="price-range-value">
            {formatPrice(filters.priceMin)} — {formatPrice(filters.priceMax)}
          </output>
          <label className="sr-only" htmlFor={id + "-min"}>
            Precio mínimo por noche
          </label>
          <input
            id={id + "-min"}
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={1000}
            value={filters.priceMin}
            onChange={(event) =>
              patch({ priceMin: Math.min(Number(event.target.value), filters.priceMax - 1000) })
            }
          />
          <label className="sr-only" htmlFor={id + "-max"}>
            Precio máximo por noche
          </label>
          <input
            id={id + "-max"}
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={1000}
            value={filters.priceMax}
            onChange={(event) =>
              patch({ priceMax: Math.max(Number(event.target.value), filters.priceMin + 1000) })
            }
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Puntaje de huéspedes">
        <div className="rating-options" role="radiogroup" aria-label="Puntaje mínimo">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={filters.minRating === option.value}
              className={"pill-option " + (filters.minRating === option.value ? "is-active" : "")}
              onClick={() => patch({ minRating: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Categoría">
        <div className="star-options">
          {[5, 4, 3, 0].map((star) => (
            <button
              key={star}
              type="button"
              aria-pressed={filters.stars.includes(star)}
              className={"pill-option " + (filters.stars.includes(star) ? "is-active" : "")}
              onClick={() => patch({ stars: toggle(filters.stars, star) })}
            >
              {star === 0 ? (
                "Sin categoría"
              ) : (
                <>
                  {star} <Icon name="star" size={13} />
                </>
              )}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Barrio o cerro">
        <ul className="check-list">
          {NEIGHBORHOODS.map((n) => (
            <li key={n.name}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={filters.neighborhoods.includes(n.name)}
                  onChange={() =>
                    patch({ neighborhoods: toggle<Neighborhood>(filters.neighborhoods, n.name) })
                  }
                />
                <span className="check-box" aria-hidden="true">
                  <Icon name="check" size={13} />
                </span>
                <span className="check-label">{n.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Tipo de alojamiento">
        <ul className="check-list">
          {PROPERTY_TYPES.map((type) => (
            <li key={type}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => patch({ types: toggle<PropertyType>(filters.types, type) })}
                />
                <span className="check-box" aria-hidden="true">
                  <Icon name="check" size={13} />
                </span>
                <span className="check-label">{type}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Servicios">
        <ul className="check-list">
          {AMENITIES.map((amenity) => (
            <li key={amenity.id}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity.id)}
                  onChange={() => patch({ amenities: toggle<AmenityId>(filters.amenities, amenity.id) })}
                />
                <span className="check-box" aria-hidden="true">
                  <Icon name="check" size={13} />
                </span>
                <span className="check-label">
                  <Icon name={amenity.icon} size={14} />
                  {amenity.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Condiciones">
        <ul className="check-list">
          <li>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.freeCancellation}
                onChange={() => patch({ freeCancellation: !filters.freeCancellation })}
              />
              <span className="check-box" aria-hidden="true">
                <Icon name="check" size={13} />
              </span>
              <span className="check-label">Cancelación gratis</span>
            </label>
          </li>
          <li>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.breakfastIncluded}
                onChange={() => patch({ breakfastIncluded: !filters.breakfastIncluded })}
              />
              <span className="check-box" aria-hidden="true">
                <Icon name="check" size={13} />
              </span>
              <span className="check-label">Desayuno incluido</span>
            </label>
          </li>
        </ul>
      </FilterGroup>
    </div>
  )
}
