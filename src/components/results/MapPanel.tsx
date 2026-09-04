import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Hotel } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { formatPriceCompact, formatRating } from '@/lib/format'

/** Recorte geográfico por defecto: el casco histórico de Valparaíso. */
const CITY_BOUNDS = { latMin: -33.05, latMax: -33.028, lngMin: -71.648, lngMax: -71.602 }
const VIEW = { w: 600, h: 420 }

/** Span mínimo en grados; evita hacer zoom infinito sobre uno o dos hoteles. */
const MIN_SPAN = { lat: 0.006, lng: 0.012 }

interface Bounds {
  latMin: number
  latMax: number
  lngMin: number
  lngMax: number
}

/**
 * Encuadra el mapa sobre los alojamientos visibles en lugar de sobre la ciudad
 * entera: los cerros del casco historico caben en pocas cuadras y con el
 * encuadre fijo todas las burbujas caian en la misma columna.
 */
function fitBounds(hotels: Hotel[]): Bounds {
  if (hotels.length === 0) return CITY_BOUNDS

  const lats = hotels.map((h) => h.coords.lat)
  const lngs = hotels.map((h) => h.coords.lng)
  const latMid = (Math.min(...lats) + Math.max(...lats)) / 2
  const lngMid = (Math.min(...lngs) + Math.max(...lngs)) / 2
  // 35 % de aire alrededor para que ningun pin quede pegado al borde.
  const latSpan = Math.max(MIN_SPAN.lat, (Math.max(...lats) - Math.min(...lats)) * 1.35)
  const lngSpan = Math.max(MIN_SPAN.lng, (Math.max(...lngs) - Math.min(...lngs)) * 1.35)

  return {
    latMin: latMid - latSpan / 2,
    latMax: latMid + latSpan / 2,
    lngMin: lngMid - lngSpan / 2,
    lngMax: lngMid + lngSpan / 2,
  }
}

const PIN = { w: 62, h: 30 }

interface Placed {
  id: string
  x: number
  y: number
}

function project(lat: number, lng: number, bounds: Bounds): { x: number; y: number } {
  const x = ((lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * VIEW.w
  const y = ((bounds.latMax - lat) / (bounds.latMax - bounds.latMin)) * VIEW.h
  return {
    x: Math.max(PIN.w / 2 + 4, Math.min(VIEW.w - PIN.w / 2 - 4, x)),
    y: Math.max(PIN.h, Math.min(VIEW.h - PIN.h, y)),
  }
}

/**
 * Los cerros del casco historico caben en pocas cuadras, asi que las burbujas
 * de precio se pisan. Se colocan de arriba hacia abajo y cada una que choque
 * con otra ya ubicada se empuja en vertical hasta encontrar hueco.
 */
function layoutPins(hotels: Hotel[], bounds: Bounds): Placed[] {
  const placed: Placed[] = []

  const collides = (x: number, y: number) =>
    placed.some((p) => Math.abs(p.x - x) < PIN.w && Math.abs(p.y - y) < PIN.h)

  const ordered = [...hotels].sort(
    (a, b) =>
      project(b.coords.lat, b.coords.lng, bounds).y - project(a.coords.lat, a.coords.lng, bounds).y,
  )

  // Candidatos en espiral: primero arriba/abajo, luego a los lados y en diagonal.
  const OFFSETS: ReadonlyArray<[number, number]> = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
    [0, -2], [0, 2], [-2, 0], [2, 0],
  ]

  for (const hotel of ordered) {
    const base = project(hotel.coords.lat, hotel.coords.lng, bounds)
    let x = base.x
    let y = base.y

    if (collides(x, y)) {
      for (let ring = 1; ring <= 3; ring += 1) {
        const hit = OFFSETS.map(([dx, dy]) => ({
          x: Math.max(PIN.w / 2 + 4, Math.min(VIEW.w - PIN.w / 2 - 4, base.x + dx * PIN.w * ring)),
          y: Math.max(PIN.h, Math.min(VIEW.h - PIN.h, base.y + dy * PIN.h * ring)),
        })).find((c) => !collides(c.x, c.y))

        if (hit) {
          x = hit.x
          y = hit.y
          break
        }
      }
    }

    placed.push({ id: hotel.id, x, y })
  }

  return placed
}

interface MapPanelProps {
  hotels: Hotel[]
  activeId: string | null
  onHover: (id: string | null) => void
  searchParams?: string
}

/**
 * Mapa esquemático de la bahía. No usa tiles externos: dibuja la costa y los
 * cerros como formas propias y proyecta las coordenadas de cada alojamiento.
 */
export function MapPanel({ hotels, activeId, onHover, searchParams }: MapPanelProps) {
  const bounds = useMemo(() => fitBounds(hotels), [hotels])
  const pins = useMemo(() => layoutPins(hotels, bounds), [hotels, bounds])
  const byId = useMemo(() => new Map(hotels.map((h) => [h.id, h])), [hotels])
  const active = activeId === null ? null : (byId.get(activeId) ?? null)

  return (
    <div className="map-panel">
      <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="map-canvas" role="img" aria-label="Mapa de la bahía de Valparaíso con los alojamientos del listado">
        <defs>
          <linearGradient id="map-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b8cc0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8fb6d2" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <rect width={VIEW.w} height={VIEW.h} fill="#e7eaf3" />

        {/* bahía */}
        <path d="M0 0h600v150c-90 26-150-6-230 18S210 210 120 186 30 150 0 158Z" fill="url(#map-sea)" />
        <path
          d="M0 158c30-8 60 4 120 28s170 6 250-18 140 8 230-18"
          fill="none"
          stroke="#3d78b8"
          strokeWidth="2"
          strokeOpacity="0.7"
        />

        {/* curvas de nivel de los cerros */}
        {[210, 250, 292, 336].map((offset, i) => (
          <path
            key={offset}
            d={`M0 ${offset}c60-14 120 10 190-6s150 14 230-10 120 6 180-4`}
            fill="none"
            stroke="#111236"
            strokeOpacity={0.06 + i * 0.015}
            strokeWidth="2"
          />
        ))}

        {/* trazas de las principales avenidas del plan */}
        <path d="M20 176h560" stroke="#111236" strokeOpacity="0.10" strokeWidth="6" strokeLinecap="round" />
        <path d="M40 196h520" stroke="#111236" strokeOpacity="0.07" strokeWidth="4" strokeLinecap="round" />

        <text x="470" y="60" className="map-label">
          Bahía de Valparaíso
        </text>
        <text x="30" y="330" className="map-label">
          Los cerros
        </text>

        {pins.map(({ id, x, y }) => {
          const hotel = byId.get(id)
          if (!hotel) return null
          const isActive = hotel.id === activeId
          return (
            <g
              key={hotel.id}
              className={`map-pin ${isActive ? 'is-active' : ''}`}
              transform={`translate(${x} ${y})`}
              onMouseEnter={() => onHover(hotel.id)}
              onMouseLeave={() => onHover(null)}
            >
              <path d="M-5 8 L5 8 L0 17 Z" className="map-pin-tip" />
              <rect x="-30" y="-15" width="60" height="25" rx="6" className="map-pin-bubble" />
              <text x="0" y="2" className="map-pin-price">
                {formatPriceCompact(hotel.pricePerNight)}
              </text>
            </g>
          )
        })}
      </svg>

      {active && (
        <div className="map-card">
          <p className="map-card-name">{active.name}</p>
          <p className="map-card-meta">
            {active.neighborhood} · {formatRating(active.rating)}/10
          </p>
          <Link
            to={`/hotel/${active.slug}${searchParams ? `?${searchParams}` : ''}`}
            className="arrow-link"
          >
            Ver ficha
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      )}

      <p className="map-disclaimer">
        Mapa esquemático: las posiciones son aproximadas y sirven para ubicar los cerros entre sí.
      </p>
    </div>
  )
}
