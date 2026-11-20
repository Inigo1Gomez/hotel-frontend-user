import type { Hotel, SearchQuery, SearchResult } from '@/types/hotel'
import { HOTELS, findHotelBySlug } from '@/data/hotels'
import { matchesFilters, sortHotels } from '@/lib/filters'
import { delay } from './client'
import { IS_CATALOG_DEMO, listarHotelesCatalogo, obtenerHotelCatalogo } from './catalogo'

/** Hoteles del catálogo (hotel-ms-catalogo) o, en modo demo, el dataset local. */
async function todosLosHoteles(signal?: AbortSignal, demoMs = 320): Promise<Hotel[]> {
  if (!IS_CATALOG_DEMO) return listarHotelesCatalogo(signal)
  await delay(demoMs, signal)
  return HOTELS
}

function rangoPrecios(hotels: Hotel[]): { min: number; max: number } {
  const precios = hotels.map((hotel) => hotel.pricePerNight)
  return precios.length ? { min: Math.min(...precios), max: Math.max(...precios) } : { min: 0, max: 0 }
}

/** El catálogo devuelve todos los hoteles de una vez; filtros, orden y paginación se aplican en el navegador. */
export async function searchHotels(query: SearchQuery, signal?: AbortSignal): Promise<SearchResult> {
  const hotels = await todosLosHoteles(signal)
  const matched = sortHotels(
    hotels.filter((hotel) => matchesFilters(hotel, query.filters)),
    query.sort,
  )
  const start = (query.page - 1) * query.pageSize

  return {
    hotels: matched.slice(start, start + query.pageSize),
    total: matched.length,
    page: query.page,
    pageSize: query.pageSize,
    priceBounds: rangoPrecios(hotels),
  }
}

export async function getHotelBySlug(slug: string, signal?: AbortSignal): Promise<Hotel> {
  const hotel = (await todosLosHoteles(signal, 220)).find((h) => h.slug === slug) ?? (IS_CATALOG_DEMO ? findHotelBySlug(slug) : undefined)
  if (!hotel) throw new Error(`No encontramos el alojamiento «${slug}».`)
  if (IS_CATALOG_DEMO) return hotel
  // La ficha se pide fresca: precios y habitaciones activas al día.
  const fresco = await obtenerHotelCatalogo(hotel.id, signal)
  if (!fresco) throw new Error(`«${hotel.name}» no tiene habitaciones disponibles por ahora.`)
  return fresco
}

export async function getFeaturedHotels(limit = 6, signal?: AbortSignal): Promise<Hotel[]> {
  const hotels = await todosLosHoteles(signal, 180)
  const featured = hotels.filter((h) => h.featured)
  const rest = hotels.filter((h) => !h.featured).sort((a, b) => b.rating - a.rating)
  return [...featured, ...rest].slice(0, limit)
}
