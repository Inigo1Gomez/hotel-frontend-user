/** Formateo de precios, fechas y textos de la interfaz (es-CL). */

const CLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const CLP_COMPACT = new Intl.NumberFormat('es-CL', {
  notation: 'compact',
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return CLP.format(value)
}

export function formatPriceCompact(value: number): string {
  return `$${CLP_COMPACT.format(value)}`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CL').format(value)
}

/** `2026-09-04` -> `vie, 4 sept` */
export function formatShortDate(iso: string): string {
  const date = parseISODate(iso)
  if (!date) return ''
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

/** `2026-09-04` -> `4 de septiembre de 2026` */
export function formatLongDate(iso: string): string {
  const date = parseISODate(iso)
  if (!date) return ''
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** Interpreta `YYYY-MM-DD` en UTC para que la fecha no se corra por zona horaria. */
export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Convierte a `YYYY-MM-DD` usando los componentes locales de la fecha.
 * `toISOString()` desplazaria el dia para quien esta en UTC-3/-4.
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso)
  if (!date) return iso
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Noches entre dos fechas; siempre >= 1 para no dividir por cero al calcular totales. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const from = parseISODate(checkIn)
  const to = parseISODate(checkOut)
  if (!from || !to) return 1
  const diff = Math.round((to.getTime() - from.getTime()) / 86_400_000)
  return diff > 0 ? diff : 1
}

/** Etiqueta cualitativa del puntaje, al estilo de los metabuscadores. */
export function ratingLabel(score: number): string {
  if (score >= 9) return 'Excepcional'
  if (score >= 8.5) return 'Muy bueno'
  if (score >= 8) return 'Bueno'
  if (score >= 7) return 'Agradable'
  return 'Correcto'
}

export function formatRating(score: number): string {
  return score.toFixed(1).replace('.', ',')
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m del centro`
  return `${km.toFixed(1).replace('.', ',')} km del centro`
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

/** Texto accesible para el resumen de huespedes. */
export function guestsLabel(adults: number, children: number, rooms: number): string {
  const parts = [`${adults} ${pluralize(adults, 'adulto', 'adultos')}`]
  if (children > 0) parts.push(`${children} ${pluralize(children, 'niño', 'niños')}`)
  parts.push(`${rooms} ${pluralize(rooms, 'habitación', 'habitaciones')}`)
  return parts.join(' · ')
}
