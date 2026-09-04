import type {
  AmenityId,
  HotelFilters,
  Neighborhood,
  PropertyType,
  SearchQuery,
  SortKey,
} from '@/types/hotel'
import { AMENITIES } from '@/data/amenities'
import { NEIGHBORHOODS } from '@/data/neighborhoods'
import { PRICE_BOUNDS } from '@/data/hotels'
import { SORT_OPTIONS, defaultFilters } from './filters'
import { addDays, toISODate } from './format'

export const PAGE_SIZE = 6
export const PROPERTY_TYPES: PropertyType[] = [
  'Hotel',
  'Hotel boutique',
  'Hostal',
  'Bed & Breakfast',
  'Apartamento',
  'Cabaña',
]

const VALID_AMENITIES = new Set<string>(AMENITIES.map((a) => a.id))
const VALID_NEIGHBORHOODS = new Set<string>(NEIGHBORHOODS.map((n) => n.name))
const VALID_TYPES = new Set<string>(PROPERTY_TYPES)
const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((s) => s.value))

/** Check-in por defecto: dentro de 30 dias, dos noches. */
export function defaultSearchQuery(): SearchQuery {
  const checkIn = addDays(toISODate(new Date()), 30)
  return {
    destination: 'Valparaíso, Chile',
    checkIn,
    checkOut: addDays(checkIn, 2),
    guests: { adults: 2, children: 0, rooms: 1 },
    filters: defaultFilters(),
    sort: 'recomendado',
    page: 1,
    pageSize: PAGE_SIZE,
  }
}

function intParam(params: URLSearchParams, key: string, fallback: number, min: number, max: number): number {
  const raw = params.get(key)
  if (raw === null) return fallback
  const value = Number.parseInt(raw, 10)
  if (Number.isNaN(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function dateParam(params: URLSearchParams, key: string, fallback: string): string {
  const raw = params.get(key)
  return raw !== null && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback
}

/** Reconstruye la busqueda desde la URL, descartando valores no validos. */
export function parseSearchQuery(params: URLSearchParams): SearchQuery {
  const base = defaultSearchQuery()
  const checkIn = dateParam(params, 'checkIn', base.checkIn)
  let checkOut = dateParam(params, 'checkOut', base.checkOut)
  if (checkOut <= checkIn) checkOut = addDays(checkIn, 1)

  const sortRaw = params.get('orden')
  const sort: SortKey = sortRaw !== null && VALID_SORTS.has(sortRaw) ? (sortRaw as SortKey) : base.sort

  const filters: HotelFilters = {
    priceMin: intParam(params, 'precioMin', PRICE_BOUNDS.min, PRICE_BOUNDS.min, PRICE_BOUNDS.max),
    priceMax: intParam(params, 'precioMax', PRICE_BOUNDS.max, PRICE_BOUNDS.min, PRICE_BOUNDS.max),
    stars: params
      .getAll('estrellas')
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 5),
    minRating: Number.parseFloat(params.get('puntajeMin') ?? '0') || 0,
    neighborhoods: params.getAll('barrio').filter((n) => VALID_NEIGHBORHOODS.has(n)) as Neighborhood[],
    types: params.getAll('tipo').filter((t) => VALID_TYPES.has(t)) as PropertyType[],
    amenities: params.getAll('servicio').filter((a) => VALID_AMENITIES.has(a)) as AmenityId[],
    freeCancellation: params.get('cancelacionGratis') === 'true',
    breakfastIncluded: params.get('desayuno') === 'true',
    query: params.get('q') ?? '',
  }

  if (filters.priceMin > filters.priceMax) {
    filters.priceMin = PRICE_BOUNDS.min
    filters.priceMax = PRICE_BOUNDS.max
  }

  return {
    destination: params.get('destino') ?? base.destination,
    checkIn,
    checkOut,
    guests: {
      adults: intParam(params, 'adultos', 2, 1, 12),
      children: intParam(params, 'ninos', 0, 0, 8),
      rooms: intParam(params, 'habitaciones', 1, 1, 6),
    },
    filters,
    sort,
    page: intParam(params, 'pagina', 1, 1, 200),
    pageSize: PAGE_SIZE,
  }
}

/** Solo escribe en la URL lo que difiere del estado por defecto: enlaces cortos y limpios. */
export function serializeSearchQuery(query: SearchQuery): URLSearchParams {
  const params = new URLSearchParams()
  const base = defaultSearchQuery()

  params.set('destino', query.destination)
  params.set('checkIn', query.checkIn)
  params.set('checkOut', query.checkOut)
  if (query.guests.adults !== 2) params.set('adultos', String(query.guests.adults))
  if (query.guests.children !== 0) params.set('ninos', String(query.guests.children))
  if (query.guests.rooms !== 1) params.set('habitaciones', String(query.guests.rooms))
  if (query.sort !== base.sort) params.set('orden', query.sort)
  if (query.page !== 1) params.set('pagina', String(query.page))

  const { filters } = query
  if (filters.priceMin > PRICE_BOUNDS.min) params.set('precioMin', String(filters.priceMin))
  if (filters.priceMax < PRICE_BOUNDS.max) params.set('precioMax', String(filters.priceMax))
  for (const star of filters.stars) params.append('estrellas', String(star))
  if (filters.minRating > 0) params.set('puntajeMin', String(filters.minRating))
  for (const n of filters.neighborhoods) params.append('barrio', n)
  for (const t of filters.types) params.append('tipo', t)
  for (const a of filters.amenities) params.append('servicio', a)
  if (filters.freeCancellation) params.set('cancelacionGratis', 'true')
  if (filters.breakfastIncluded) params.set('desayuno', 'true')
  if (filters.query.trim() !== '') params.set('q', filters.query.trim())

  return params
}

/** Construye el enlace a la pagina de resultados desde el buscador de la portada. */
export function buildSearchUrl(query: SearchQuery): string {
  return `/hoteles?${serializeSearchQuery(query).toString()}`
}
