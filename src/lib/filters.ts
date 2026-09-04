import type { Hotel, HotelFilters, SortKey } from '@/types/hotel'
import { PRICE_BOUNDS } from '@/data/hotels'

export const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: 'recomendado', label: 'Recomendados' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor puntuados' },
  { value: 'distancia', label: 'Distancia al centro' },
  { value: 'estrellas', label: 'Más estrellas' },
]

export const RATING_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 0, label: 'Cualquiera' },
  { value: 7, label: '7+ Agradable' },
  { value: 8, label: '8+ Bueno' },
  { value: 8.5, label: '8,5+ Muy bueno' },
  { value: 9, label: '9+ Excepcional' },
]

export function defaultFilters(): HotelFilters {
  return {
    priceMin: PRICE_BOUNDS.min,
    priceMax: PRICE_BOUNDS.max,
    stars: [],
    minRating: 0,
    neighborhoods: [],
    types: [],
    amenities: [],
    freeCancellation: false,
    breakfastIncluded: false,
    query: '',
  }
}

/** Cuenta cuantos criterios se apartan del estado por defecto (para el badge "limpiar"). */
export function countActiveFilters(filters: HotelFilters): number {
  const base = defaultFilters()
  let count = 0
  if (filters.priceMin > base.priceMin || filters.priceMax < base.priceMax) count += 1
  count += filters.stars.length
  if (filters.minRating > 0) count += 1
  count += filters.neighborhoods.length
  count += filters.types.length
  count += filters.amenities.length
  if (filters.freeCancellation) count += 1
  if (filters.breakfastIncluded) count += 1
  if (filters.query.trim() !== '') count += 1
  return count
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesFilters(hotel: Hotel, filters: HotelFilters): boolean {
  if (hotel.pricePerNight < filters.priceMin || hotel.pricePerNight > filters.priceMax) return false
  if (filters.stars.length > 0 && !filters.stars.includes(hotel.stars)) return false
  if (hotel.rating < filters.minRating) return false
  if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(hotel.neighborhood)) return false
  if (filters.types.length > 0 && !filters.types.includes(hotel.type)) return false
  if (filters.amenities.length > 0 && !filters.amenities.every((a) => hotel.amenities.includes(a))) return false
  if (filters.freeCancellation && !hotel.deals.some((d) => d.freeCancellation)) return false
  if (filters.breakfastIncluded && !hotel.amenities.includes('desayuno')) return false

  const q = normalize(filters.query)
  if (q !== '') {
    const haystack = normalize(
      `${hotel.name} ${hotel.neighborhood} ${hotel.type} ${hotel.address} ${hotel.shortDescription}`,
    )
    if (!haystack.includes(q)) return false
  }
  return true
}

/**
 * Puntaje del orden "Recomendados": mezcla calidad percibida, volumen de
 * resenas, cercania al centro y conveniencia de precio.
 */
function recommendationScore(hotel: Hotel): number {
  const priceSpan = Math.max(1, PRICE_BOUNDS.max - PRICE_BOUNDS.min)
  const affordability = 1 - (hotel.pricePerNight - PRICE_BOUNDS.min) / priceSpan
  const popularity = Math.min(1, hotel.reviewsCount / 1500)
  const proximity = Math.max(0, 1 - hotel.distanceToCenterKm / 3)

  return (
    hotel.rating * 0.55 +
    popularity * 1.6 +
    proximity * 1.4 +
    affordability * 1.1 +
    (hotel.featured ? 0.6 : 0)
  )
}

export function sortHotels(hotels: Hotel[], sort: SortKey): Hotel[] {
  const sorted = [...hotels]
  switch (sort) {
    case 'precio-asc':
      return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight)
    case 'precio-desc':
      return sorted.sort((a, b) => b.pricePerNight - a.pricePerNight)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
    case 'distancia':
      return sorted.sort((a, b) => a.distanceToCenterKm - b.distanceToCenterKm)
    case 'estrellas':
      return sorted.sort((a, b) => b.stars - a.stars || b.rating - a.rating)
    case 'recomendado':
    default:
      return sorted.sort((a, b) => recommendationScore(b) - recommendationScore(a))
  }
}
