import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { HotelFilters, SearchCriteria, SearchResult, SortKey } from '@/types/hotel'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterSidebar } from '@/components/results/FilterSidebar'
import { HotelCard, HotelCardSkeleton } from '@/components/results/HotelCard'
import { ResultsToolbar } from '@/components/results/ResultsToolbar'
import { Pagination } from '@/components/results/Pagination'
import { EmptyState } from '@/components/results/EmptyState'
import { MapPanel } from '@/components/results/MapPanel'
import { Icon } from '@/components/ui/Icon'
import { searchHotels } from '@/api/hotels'
import { IS_DEMO_MODE } from '@/api/client'
import { countActiveFilters, defaultFilters } from '@/lib/filters'
import { parseSearchQuery, serializeSearchQuery } from '@/lib/searchParams'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { nightsBetween } from '@/lib/format'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => parseSearchQuery(searchParams), [searchParams])

  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  useLockBodyScroll(filtersOpen && !isDesktop)

  const nights = nightsBetween(query.checkIn, query.checkOut)
  const activeFilters = countActiveFilters(query.filters)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    searchHotels(query, controller.signal)
      .then((data) => {
        setResult(data)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'No pudimos cargar los alojamientos.')
        setLoading(false)
      })

    return () => controller.abort()
  }, [query])

  /** Toda la mutación de estado pasa por la URL: enlaces compartibles y botón atrás funcionando. */
  const updateQuery = useCallback(
    (patch: Partial<typeof query>) => {
      setSearchParams(serializeSearchQuery({ ...query, ...patch }), { replace: true })
    },
    [query, setSearchParams],
  )

  const onCriteriaSubmit = (criteria: SearchCriteria) => updateQuery({ ...criteria, page: 1 })
  const onFiltersChange = (filters: HotelFilters) => updateQuery({ filters, page: 1 })
  const onSortChange = (sort: SortKey) => updateQuery({ sort, page: 1 })
  const onPageChange = (page: number) => {
    updateQuery({ page })
    window.scrollTo({ top: 220, behavior: 'smooth' })
  }

  const hotels = result?.hotels ?? []
  const total = result?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize))
  const detailParams = serializeSearchQuery(query).toString()

  return (
    <div className="search-page">
      <div className="search-page-bar">
        <div className="container is-wide">
          <SearchBar
            value={{
              destination: query.destination,
              checkIn: query.checkIn,
              checkOut: query.checkOut,
              guests: query.guests,
            }}
            onSubmit={onCriteriaSubmit}
            variant="compact"
            submitLabel="Actualizar"
          />
        </div>
      </div>

      <div className="container is-wide search-page-body">
        <ResultsToolbar
          total={total}
          destination={query.destination}
          checkIn={query.checkIn}
          checkOut={query.checkOut}
          sort={query.sort}
          onSortChange={onSortChange}
          mapOpen={mapOpen}
          onToggleMap={() => setMapOpen((open) => !open)}
          onOpenFilters={() => setFiltersOpen(true)}
          activeFilters={activeFilters}
        />

        {IS_DEMO_MODE && (
          <p className="demo-note">
            <Icon name="sparkles" size={16} />
            <span>
              <strong>Modo demo.</strong> Precios, disponibilidad y opiniones son ficticios. Define{' '}
              <code>VITE_API_URL</code> para consumir el microservicio de reservas.
            </span>
          </p>
        )}

        <div className={`search-layout ${mapOpen ? 'has-map' : ''}`}>
          <aside
            className={`search-filters ${filtersOpen ? 'is-open' : ''}`}
            aria-label="Filtros de búsqueda"
          >
            <div className="search-filters-head">
              <span>Filtros</span>
              <button
                type="button"
                className="search-filters-close"
                onClick={() => setFiltersOpen(false)}
                aria-label="Cerrar filtros"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <FilterSidebar filters={query.filters} onChange={onFiltersChange} resultCount={total} />
            <div className="search-filters-foot">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setFiltersOpen(false)}
              >
                Ver {total} resultados
              </button>
            </div>
          </aside>

          {filtersOpen && !isDesktop && (
            <button
              type="button"
              className="search-filters-backdrop"
              onClick={() => setFiltersOpen(false)}
              aria-label="Cerrar filtros"
            />
          )}

          <div className="search-results">
            {error !== null && (
              <div className="card error-card">
                <h3>No pudimos cargar los alojamientos</h3>
                <p>{error}</p>
              </div>
            )}

            {loading && (
              <div className="results-list" aria-busy="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <HotelCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && error === null && hotels.length === 0 && (
              <EmptyState onReset={() => onFiltersChange(defaultFilters())} />
            )}

            {!loading && hotels.length > 0 && (
              <>
                <div className="results-list">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onMouseEnter={() => setHoveredId(hotel.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={hoveredId === hotel.id ? 'is-hovered' : ''}
                    >
                      <HotelCard hotel={hotel} nights={nights} searchParams={detailParams} />
                    </div>
                  ))}
                </div>
                <Pagination page={query.page} pageCount={pageCount} onChange={onPageChange} />
              </>
            )}
          </div>

          {mapOpen && (
            <div className="search-map">
              <MapPanel
                hotels={hotels}
                activeId={hoveredId}
                onHover={setHoveredId}
                searchParams={detailParams}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
