import type { Hotel, SearchQuery, SearchResult } from '@/types/hotel'
import { HOTELS, PRICE_BOUNDS, findHotelBySlug } from '@/data/hotels'
import { matchesFilters, sortHotels } from '@/lib/filters'
import { IS_DEMO_MODE, delay, request } from './client'

/** Serializa la busqueda a query string para el microservicio de reservas. */
function toQueryString(query: SearchQuery): string {
  const params = new URLSearchParams({
    destino: query.destination,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    adultos: String(query.guests.adults),
    ninos: String(query.guests.children),
    habitaciones: String(query.guests.rooms),
    orden: query.sort,
    pagina: String(query.page),
    tamano: String(query.pageSize),
    precioMin: String(query.filters.priceMin),
    precioMax: String(query.filters.priceMax),
    puntajeMin: String(query.filters.minRating),
  })
  for (const star of query.filters.stars) params.append('estrellas', String(star))
  for (const n of query.filters.neighborhoods) params.append('barrio', n)
  for (const t of query.filters.types) params.append('tipo', t)
  for (const a of query.filters.amenities) params.append('servicio', a)
  if (query.filters.freeCancellation) params.set('cancelacionGratis', 'true')
  if (query.filters.breakfastIncluded) params.set('desayuno', 'true')
  if (query.filters.query.trim() !== '') params.set('q', query.filters.query.trim())
  return params.toString()
}

export async function searchHotels(query: SearchQuery, signal?: AbortSignal): Promise<SearchResult> {
  if (!IS_DEMO_MODE) {
    return request<SearchResult>(`/hotels?${toQueryString(query)}`, { signal })
  }

  await delay(320, signal)

  const matched = sortHotels(
    HOTELS.filter((hotel) => matchesFilters(hotel, query.filters)),
    query.sort,
  )
  const start = (query.page - 1) * query.pageSize

  return {
    hotels: matched.slice(start, start + query.pageSize),
    total: matched.length,
    page: query.page,
    pageSize: query.pageSize,
    priceBounds: PRICE_BOUNDS,
  }
}

export async function getHotelBySlug(slug: string, signal?: AbortSignal): Promise<Hotel> {
  if (!IS_DEMO_MODE) {
    return request<Hotel>(`/hotels/${encodeURIComponent(slug)}`, { signal })
  }

  await delay(220, signal)

  const hotel = findHotelBySlug(slug)
  if (!hotel) throw new Error(`No encontramos el alojamiento «${slug}».`)
  return hotel
}

export async function getFeaturedHotels(limit = 6, signal?: AbortSignal): Promise<Hotel[]> {
  if (!IS_DEMO_MODE) {
    return request<Hotel[]>(`/hotels/destacados?limite=${limit}`, { signal })
  }

  await delay(180, signal)

  const featured = HOTELS.filter((h) => h.featured)
  const rest = HOTELS.filter((h) => !h.featured).sort((a, b) => b.rating - a.rating)
  return [...featured, ...rest].slice(0, limit)
}
