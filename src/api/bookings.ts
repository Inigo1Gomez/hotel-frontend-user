import type { Guests, Hotel, RoomOption } from '@/types/hotel'
import { delay, request } from './client'

/**
 * URL base de hotel-ms-reservas para crear reservas.
 *
 * Va aparte de `VITE_API_URL` (catalogo): el microservicio todavia no expone
 * /hotels, pero si recibe reservas. Si esta vacia, la reserva queda en modo demo.
 */
export const BOOKINGS_URL: string = (import.meta.env.VITE_RESERVAS_URL ?? '').trim()

export const IS_BOOKING_DEMO = BOOKINGS_URL === ''

/** Cuerpo de POST /api/v1/user/reservas: espejo de IReserva en hotel-ms-reservas. */
export interface ReservaPayload {
  codigo: string
  idHabitacion: string
  huesped: { nombre: string; apellido: string; email: string; telefono?: string }
  fechaEntrada: string
  fechaSalida: string
  cantidadHuespedes: number
  estado: 'CONFIRMADA'
  precioPorNoche: number
  precioTotal: number
  observaciones?: string
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

export function newBookingCode(): string {
  return `RES-${Date.now().toString(36).toUpperCase().slice(-6)}`
}

export function toReservaPayload(booking: BookingRequest, code = newBookingCode()): ReservaPayload {
  const { hotel, room, guest } = booking
  const phone = guest.phone.trim()

  return {
    codigo: code,
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
    estado: 'CONFIRMADA',
    precioPorNoche: room.pricePerNight,
    precioTotal: booking.total,
    // La reserva solo guarda la habitacion: el hotel viaja aqui para que aparezca en el comprobante.
    observaciones: `${hotel.name} · ${room.name} (el total incluye el cargo por servicio)`,
  }
}

/**
 * Envia la reserva a hotel-ms-reservas. Al aceptarla, el microservicio publica
 * `reserva.creada` en RabbitMQ y hotel-ms-notificaciones le envia al huesped el
 * comprobante en PDF por correo.
 */
export async function createBooking(booking: BookingRequest, signal?: AbortSignal): Promise<ReservaPayload> {
  const payload = toReservaPayload(booking)

  if (IS_BOOKING_DEMO) {
    await delay(400, signal)
    return payload
  }

  const { data } = await request<{ data: ReservaPayload }>('/api/v1/user/reservas', {
    method: 'POST',
    body: payload,
    signal,
    baseUrl: BOOKINGS_URL,
  })
  return data
}
