import { useMemo } from 'react'

/**
 * Imagen de respaldo del alojamiento.
 *
 * En modo demo no hay fotografias: cada alojamiento recibe siempre la misma
 * vista de casas sobre el cerro, derivada de su id. Tonos apagados y sin
 * contornos duros, para que funcione como marcador de foto y no como
 * ilustracion decorativa. Si el backend entrega `src`, se muestra la foto.
 */

interface Facade {
  wall: string
  roof: string
}

const FACADES: readonly Facade[] = [
  { wall: '#c9805f', roof: '#8f5540' },
  { wall: '#d8ab6a', roof: '#a17b45' },
  { wall: '#7f9f8b', roof: '#566f60' },
  { wall: '#7091b5', roof: '#4b6577' },
  { wall: '#b08a9b', roof: '#7c5f6c' },
  { wall: '#9aa2b5', roof: '#6b7285' },
  { wall: '#cfa98c', roof: '#94745d' },
  { wall: '#6f8fa8', roof: '#4c6577' },
]

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

interface House {
  x: number
  y: number
  w: number
  h: number
  facade: Facade
  windows: number
}

function buildHouses(seed: number): House[] {
  const houses: House[] = []
  for (let i = 0; i < 7; i += 1) {
    const s = seed >> (i * 2)
    const w = 34 + (s % 20)
    const h = 40 + ((s >> 3) % 44)
    houses.push({
      x: 6 + i * 42 + ((s >> 5) % 8),
      y: 160 - h - ((s >> 7) % 20),
      w,
      h,
      facade: FACADES[(seed + i * 3) % FACADES.length] as Facade,
      windows: 2 + ((s >> 6) % 3),
    })
  }
  return houses
}

interface HotelImageProps {
  /** Semilla de la imagen; usar el id o el slug del alojamiento. */
  seed: string
  /** Foto real cuando el backend la entrega. */
  src?: string | undefined
  alt: string
  className?: string
  /** Cielo algo más profundo para las cabeceras grandes. */
  variant?: 'card' | 'hero'
}

export function HotelImage({ seed, src, alt, className, variant = 'card' }: HotelImageProps) {
  const value = useMemo(() => hash(seed), [seed])
  const houses = useMemo(() => buildHouses(value), [value])

  if (src) {
    return <img src={src} alt={alt} className={className} loading="lazy" />
  }

  const skyId = `sky-${seed}`
  const seaId = `sea-${seed}`
  const hillId = `hill-${seed}`
  const skyTop = variant === 'hero' ? '#9cc2e8' : '#b3d1ec'

  return (
    <svg
      className={className}
      viewBox="0 0 300 180"
      role="img"
      aria-label={alt}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor="#dbe8f5" />
        </linearGradient>
        <linearGradient id={seaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b8cc0" />
          <stop offset="100%" stopColor="#83aecb" />
        </linearGradient>
        <linearGradient id={hillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8ebf2" />
          <stop offset="100%" stopColor="#dcdfe9" />
        </linearGradient>
      </defs>

      <rect width="300" height="180" fill={`url(#${skyId})`} />
      <rect y="56" width="300" height="124" fill={`url(#${seaId})`} />

      {/* velero lejano */}
      <g fill="#5b6b80" opacity="0.5">
        <path d="M196 76h20l-3 5h-14l-3-5Z" />
        <path d="M205 75V64l9 6-9 5Z" />
      </g>
      <path d="M246 82h12l-2 3.5h-8L246 82Z" fill="#5b6b80" opacity="0.32" />

      {/* reflejos del agua */}
      <g stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round">
        <path d="M24 90h26M70 84h18M120 92h22M176 86h16" />
      </g>

      {/* ladera */}
      <path d="M0 180V104c40-13 62 4 96-9s58 5 96-8 68 10 108-4v97H0Z" fill={`url(#${hillId})`} />

      {houses.map((house, index) => (
        <g key={index}>
          <path
            d={`M${house.x - 3} ${house.y} L${house.x + house.w / 2} ${house.y - 10} L${house.x + house.w + 3} ${house.y} Z`}
            fill={house.facade.roof}
          />
          <rect x={house.x} y={house.y} width={house.w} height={house.h} fill={house.facade.wall} />
          {/* sombra lateral: da volumen sin recurrir a un contorno duro */}
          <rect x={house.x + house.w - 6} y={house.y} width="6" height={house.h} fill="#00000014" />
          {Array.from({ length: house.windows }, (_, w) => (
            <rect
              key={w}
              x={house.x + 8 + (w % 2) * (house.w - 26)}
              y={house.y + 11 + Math.floor(w / 2) * 18}
              width="10"
              height="12"
              rx="1.5"
              fill="#f4f7fb"
              fillOpacity="0.88"
            />
          ))}
        </g>
      ))}

      {/* escalera del cerro */}
      <path
        d="M150 180v-9h8v-9h8v-9h8v-9"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
