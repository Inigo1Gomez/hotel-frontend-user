import type { Guests, Hotel, RoomOption } from '@/types/hotel'
import { delay, request } from './client'

/**
 * URL base de hotel-ms-reservas.
 *
 * Desarrollo: /api/reservas (proxy de Vite). Producción: la ruta /reservas del API Gateway.
 * Si está vacía, la reserva queda en modo demo.
 */
export const BOOKINGS_URL: string = (import.meta.env.VITE_RESERVAS_URL ?? '').trim()

export const IS_BOOKING_DEMO = BOOKINGS_URL === ''

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

export const ESTADO_TEXTO: Record<EstadoReserva, string> = {
  PENDIENTE: 'Pendiente de confirmación',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
}

/**
 * Cuerpo de POST /user/reservas y /cliente/reservas: espejo de IReserva en hotel-ms-reservas.
 * No lleva código ni estado: el backend genera el código y la reserva siempre parte en PENDIENTE
 * (la confirma un operador desde el panel admin).
 */
export interface ReservaPayload {
  idHabitacion: string
  huesped: { nombre: string; apellido: string; email: string; telefono?: string }
  fechaEntrada: string
  fechaSalida: string
  cantidadHuespedes: number
  precioPorNoche: number
  precioTotal: number
  observaciones?: string
}

/** Lo que devuelve hotel-ms-reservas al crear y en "Mis reservas". */
export interface Reserva extends ReservaPayload {
  codigo: string
  estado: EstadoReserva
  createdAt?: string
}

/** Consulta pública con código + email: sin datos de contacto. */
export interface ReservaPublica {
  codigo: string
  estado: EstadoReserva
  idHabitacion: string
  huesped: { nombre: string }
  fechaEntrada: string
  fechaSalida: string
  cantidadHuespedes: number
  precioTotal: number
}

export interface PaginaReservas {
  data: Reserva[]
  total: number
  pagina: number
  tamano: number
}

export interface BookingRequest {
  hotel: Hotel
  room: RoomOption
  checkIn: string
  checkOut: string
  guests: Guests
  total: number
  guest: { firstName: string; lastName: string; email: string; phone: string }
}

export function toReservaPayload(booking: BookingRequest): ReservaPayload {
  const { hotel, room, guest } = booking
  const phone = guest.phone.trim()

  return {
    idHabitacion: room.id,
    huesped: {
      nombre: guest.firstName.trim(),
      apellido: guest.lastName.trim(),
      email: guest.email.trim(),
      ...(phone ? { telefono: phone } : {}),
    },
    fechaEntrada: booking.checkIn,
    fechaSalida: booking.checkOut,
    cantidadHuespedes: booking.guests.adults + booking.guests.children,
    precioPorNoche: room.pricePerNight,
    precioTotal: booking.total,
    // La reserva solo guarda la habitacion: el hotel viaja aqui para que aparezca en el comprobante.
    observaciones: `${hotel.name} · ${room.name} (el total incluye el cargo por servicio)`,
  }
}

/**
 * Envía la reserva a hotel-ms-reservas:
 *  - sin token: POST /api/v1/user/reservas (invitado, ruta pública).
 *  - con el access token de Cognito: POST /api/v1/cliente/reservas (queda a nombre del huésped y aparece en "Mis reservas").
 * Al aceptarla, el microservicio publica el evento en Kafka y el comando en RabbitMQ (comprobante PDF por correo).
 */
export async function createBooking(booking: BookingRequest, token?: string | null, signal?: AbortSignal): Promise<Reserva> {
  const payload = toReservaPayload(booking)

  if (IS_BOOKING_DEMO) {
    await delay(400, signal)
    return { ...payload, codigo: `RES-DEMO${Date.now().toString(36).toUpperCase().slice(-4)}`, estado: 'PENDIENTE' }
  }

  const { data } = await request<{ data: Reserva }>(token ? '/api/v1/cliente/reservas' : '/api/v1/user/reservas', {
    method: 'POST',
    body: payload,
    signal,
    baseUrl: BOOKINGS_URL,
    ...(token ? { token } : {}),
  })
  return data
}

/** GET /api/v1/user/reservas/{codigo}?email= (pública): el visitante ve el estado de su reserva. */
export async function consultarReserva(codigo: string, email: string, signal?: AbortSignal): Promise<ReservaPublica> {
  const params = new URLSearchParams({ email: email.trim() })
  const { data } = await request<{ data: ReservaPublica }>(
    `/api/v1/user/reservas/${encodeURIComponent(codigo.trim().toUpperCase())}?${params}`,
    { baseUrl: BOOKINGS_URL, signal },
  )
  return data
}

/** GET /api/v1/cliente/reservas (Cognito): solo las reservas del huésped del token. */
export async function misReservas(token: string, pagina = 1, signal?: AbortSignal): Promise<PaginaReservas> {
  return request<PaginaReservas>(`/api/v1/cliente/reservas?pagina=${pagina}&tamano=10`, {
    baseUrl: BOOKINGS_URL,
    token,
    signal,
  })
}

/** PATCH /api/v1/cliente/reservas/{codigo}/estado (Cognito): lo único que el huésped puede hacer es cancelar una propia. */
export async function cancelarReserva(token: string, codigo: string): Promise<Reserva> {
  const { data } = await request<{ data: Reserva }>(`/api/v1/cliente/reservas/${encodeURIComponent(codigo)}/estado`, {
    method: 'PATCH',
    body: { estado: 'CANCELADA' },
    baseUrl: BOOKINGS_URL,
    token,
  })
  return data
}

/** Un huésped puede cancelar mientras la reserva sigue activa (mismo flujo de estados que el backend). */
export function sePuedeCancelar(estado: EstadoReserva): boolean {
  return estado === 'PENDIENTE' || estado === 'CONFIRMADA'
}
