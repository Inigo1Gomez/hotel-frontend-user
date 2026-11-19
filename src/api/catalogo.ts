import type { Hotel, RoomOption } from '@/types/hotel'
import { HOTELS } from '@/data/hotels'
import { request } from './client'

/**
 * Catálogo público de hotel-ms-catalogo (sin token): hoteles, habitaciones, precios y disponibilidad.
 *
 * Desarrollo: /api/catalogo (proxy de Vite al puerto 8088). Producción: la ruta /catalogo del API Gateway.
 * Si queda vacía, la web usa solo el dataset local de src/data/hotels.ts (modo demo).
 */
export const CATALOGO_URL: string = (import.meta.env.VITE_CATALOGO_URL ?? '').trim()

export const IS_CATALOG_DEMO = CATALOGO_URL === ''

/** Espejo de hotel-ms-catalogo (repositories/catalogoRepository.ts y services/catalogoService.ts). */
export interface HabitacionCatalogo {
  id: string
  idHotel: string
  nombre: string
  descripcion: string
  capacidad: number
  camas: string
  metrosCuadrados: number
  precioPorNoche: number
  unidades: number
  activa: boolean
}

export interface HotelCatalogo {
  id: string
  slug: string
  nombre: string
  tipo: string
  estrellas: number
  barrio: string
  direccion: string
  precioDesde: number | null
  habitaciones: HabitacionCatalogo[]
}

export interface Disponibilidad {
  idHabitacion: string
  unidades: number
  ocupadas: number
  disponibles: number
  disponible: boolean
}

const LOCALES = new Map(HOTELS.map((hotel) => [hotel.id, hotel]))

function aHabitacion(habitacion: HabitacionCatalogo, local?: RoomOption): RoomOption {
  return {
    id: habitacion.id,
    name: habitacion.nombre,
    description: habitacion.descripcion,
    capacity: habitacion.capacidad,
    beds: habitacion.camas,
    sizeM2: habitacion.metrosCuadrados,
    pricePerNight: habitacion.precioPorNoche,
    // Las condiciones de tarifa no están en el catálogo: se mantienen las de la web.
    refundable: local?.refundable ?? true,
    breakfastIncluded: local?.breakfastIncluded ?? false,
    available: habitacion.unidades,
  }
}

/**
 * Junta el catálogo (fuente de verdad: habitaciones activas, precios y unidades) con la ficha local del hotel
 * (fotos, servicios, opiniones y ubicación, que el catálogo no guarda). Un hotel sin habitaciones activas no se muestra.
 */
export function aHotel(catalogo: HotelCatalogo): Hotel | null {
  const local = LOCALES.get(catalogo.id)
  const habitacionesLocales = new Map(local?.rooms.map((room) => [room.id, room]) ?? [])
  const rooms = catalogo.habitaciones
    .filter((habitacion) => habitacion.activa)
    .map((habitacion) => aHabitacion(habitacion, habitacionesLocales.get(habitacion.id)))
    .sort((a, b) => a.pricePerNight - b.pricePerNight)
  if (rooms.length === 0) return null

  const pricePerNight = rooms[0]!.pricePerNight
  const original = local?.originalPricePerNight ?? null

  return {
    ...(local ?? {
      id: catalogo.id,
      slug: catalogo.slug,
      coords: { lat: -33.0458, lng: -71.6197 },
      distanceToCenterKm: 1,
      rating: 8,
      reviewsCount: 0,
      currency: 'CLP' as const,
      amenities: [],
      images: [],
      shortDescription: catalogo.direccion,
      description: catalogo.direccion,
      highlights: [],
      deals: [],
      reviews: [],
      checkIn: '15:00',
      checkOut: '12:00',
      sustainable: false,
      featured: false,
    }),
    name: catalogo.nombre,
    type: catalogo.tipo as Hotel['type'],
    stars: catalogo.estrellas,
    neighborhood: catalogo.barrio as Hotel['neighborhood'],
    address: catalogo.direccion,
    pricePerNight,
    originalPricePerNight: original !== null && original > pricePerNight ? original : null,
    rooms,
  }
}

let hotelesEnCurso: Promise<Hotel[]> | null = null

/** GET /api/v1/catalogo/hoteles. Se pide una vez por carga de página: buscar, filtrar y ordenar se hace aquí. */
export function listarHotelesCatalogo(signal?: AbortSignal): Promise<Hotel[]> {
  if (!hotelesEnCurso) {
    hotelesEnCurso = request<{ data: HotelCatalogo[] }>('/api/v1/catalogo/hoteles', { baseUrl: CATALOGO_URL })
      .then(({ data }) => data.map(aHotel).filter((hotel): hotel is Hotel => hotel !== null))
      .catch((error: unknown) => {
        hotelesEnCurso = null
        throw error
      })
  }
  return conAborto(hotelesEnCurso, signal)
}

/** GET /api/v1/catalogo/hoteles/{id}: al abrir la ficha se pide fresco (precios y unidades al día). */
export async function obtenerHotelCatalogo(id: string, signal?: AbortSignal): Promise<Hotel | null> {
  const { data } = await request<{ data: HotelCatalogo }>(`/api/v1/catalogo/hoteles/${encodeURIComponent(id)}`, {
    baseUrl: CATALOGO_URL,
    signal,
  })
  return aHotel(data)
}

/** GET /api/v1/catalogo/habitaciones/{id}/disponibilidad: unidades libres entre la entrada y la salida. */
export async function disponibilidad(idHabitacion: string, desde: string, hasta: string, signal?: AbortSignal): Promise<Disponibilidad> {
  const params = new URLSearchParams({ desde, hasta })
  const { data } = await request<{ data: Disponibilidad }>(
    `/api/v1/catalogo/habitaciones/${encodeURIComponent(idHabitacion)}/disponibilidad?${params}`,
    { baseUrl: CATALOGO_URL, signal },
  )
  return data
}

function conAborto<T>(promesa: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promesa
  return new Promise<T>((resolve, reject) => {
    const abortar = () => reject(new DOMException('Aborted', 'AbortError'))
    if (signal.aborted) return abortar()
    signal.addEventListener('abort', abortar, { once: true })
    promesa.then(resolve, reject)
  })
}

/** Hotel y habitación de una reserva (la reserva solo guarda idHabitacion). */
export async function buscarHabitacion(idHabitacion: string): Promise<{ hotel: Hotel; room: RoomOption } | null> {
  const hoteles = IS_CATALOG_DEMO ? HOTELS : await listarHotelesCatalogo().catch(() => HOTELS)
  for (const hotel of hoteles) {
    const room = hotel.rooms.find((r) => r.id === idHabitacion)
    if (room) return { hotel, room }
  }
  return null
}
