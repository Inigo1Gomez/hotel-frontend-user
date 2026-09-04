import type { SortKey } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { SORT_OPTIONS } from '@/lib/filters'
import { formatShortDate } from '@/lib/format'

interface ResultsToolbarProps {
  total: number
  destination: string
  checkIn: string
  checkOut: string
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  mapOpen: boolean
  onToggleMap: () => void
  onOpenFilters: () => void
  activeFilters: number
}

export function ResultsToolbar({
  total,
  destination,
  checkIn,
  checkOut,
  sort,
  onSortChange,
  mapOpen,
  onToggleMap,
  onOpenFilters,
  activeFilters,
}: ResultsToolbarProps) {
  return (
    <div className="results-toolbar">
      <div className="results-summary">
        <h1 className="results-title">
          {total} {total === 1 ? 'alojamiento' : 'alojamientos'} en {destination.split(',')[0]}
        </h1>
        <p className="results-dates">
          {formatShortDate(checkIn)} — {formatShortDate(checkOut)}
        </p>
      </div>

      <div className="results-actions">
        <button type="button" className="btn btn-outline btn-sm results-filter-btn" onClick={onOpenFilters}>
          <Icon name="sliders" size={16} />
          Filtros
          {activeFilters > 0 && <span className="results-filter-count">{activeFilters}</span>}
        </button>

        <button
          type="button"
          className={`btn btn-outline btn-sm ${mapOpen ? 'is-active' : ''}`}
          onClick={onToggleMap}
          aria-pressed={mapOpen}
        >
          <Icon name="map" size={16} />
          {mapOpen ? 'Ocultar mapa' : 'Ver mapa'}
        </button>

        <label className="sort-select">
          <span className="sr-only">Ordenar resultados</span>
          <select value={sort} onChange={(event) => onSortChange(event.target.value as SortKey)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={16} />
        </label>
      </div>
    </div>
  )
}
