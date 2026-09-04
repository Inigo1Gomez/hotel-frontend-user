import type { SVGProps } from 'react'

export type IconName =
  | 'search'
  | 'calendar'
  | 'users'
  | 'pin'
  | 'star'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'close'
  | 'check'
  | 'sliders'
  | 'map'
  | 'heart'
  | 'wifi'
  | 'coffee'
  | 'car'
  | 'wave'
  | 'sun'
  | 'utensils'
  | 'glass'
  | 'spa'
  | 'pool'
  | 'dumbbell'
  | 'paw'
  | 'snow'
  | 'flame'
  | 'accessible'
  | 'pot'
  | 'laundry'
  | 'clock'
  | 'shuttle'
  | 'leaf'
  | 'shield'
  | 'sparkles'
  | 'ticket'

/** Trazos de 24x24 dibujados con `stroke`, salvo los marcados como rellenos. */
const PATHS: Record<IconName, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  calendar: 'M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M18 21h4a5 5 0 0 0-3-4.6',
  pin: 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  star: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 18l-6-6 6-6',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-up': 'm6 15 6-6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'm5 13 4 4L19 7',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 3v6M8 9v6M16 15v6',
  map: 'm9 4-6 3v13l6-3 6 3 6-3V4l-6 3-6-3ZM9 4v13M15 7v13',
  heart: 'M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7-.7c0 5-7 12.7-7 12.7Z',
  wifi: 'M2 8.5a16 16 0 0 1 20 0M5 12.5a11 11 0 0 1 14 0M8.5 16.4a6 6 0 0 1 7 0M12 20h.01',
  coffee: 'M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9ZM16 10h2a2 2 0 0 1 0 5h-2M6 3v2M10 3v2M14 3v2',
  car: 'M5 16v2M19 16v2M4 16h16M6 16a2 2 0 1 1 0-.1M18 16a2 2 0 1 1 0-.1M4 12l1.8-4.4A2 2 0 0 1 7.6 6h8.8a2 2 0 0 1 1.8 1.6L20 12v4H4v-4Z',
  wave: 'M2 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2',
  sun: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19',
  utensils: 'M6 3v8a2 2 0 0 0 4 0V3M8 11v10M17 3c-1.5 1-2 3-2 5s.5 3 2 3v10',
  glass: 'M6 3h12l-5 8v7h3M9 18h3M6 3l5 8',
  spa: 'M12 20c0-5 3-9 8-10-1 6-4 9-8 10ZM12 20C12 15 9 11 4 10c1 6 4 9 8 10ZM12 20v2',
  pool: 'M3 18c1.5 0 1.5-1.5 3-1.5S7.5 18 9 18s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5M7 15V5a2 2 0 0 1 4 0M13 15V5a2 2 0 0 1 4 0M7 8h4M13 8h4',
  dumbbell: 'M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10',
  paw: 'M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4.5 15a1.8 1.8 0 1 0 0-3.5 1.8 1.8 0 0 0 0 3.5ZM19.5 15a1.8 1.8 0 1 0 0-3.5 1.8 1.8 0 0 0 0 3.5ZM12 20c-2.5 0-4.5-1.6-4.5-3.5S9.5 12 12 12s4.5 2.6 4.5 4.5S14.5 20 12 20Z',
  snow: 'M12 2v20M4 7l16 10M20 7 4 17M12 6l2-2M12 6l-2-2M12 18l2 2M12 18l-2 2',
  flame: 'M12 22c3.9 0 6-2.6 6-6 0-4-3-5-3-9-3 1.5-4 4-4 6-1 0-2-1-2-3-2 1.8-3 4-3 6 0 3.4 2.1 6 6 6Z',
  accessible: 'M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 10h6l1 5M9 10v4h5M9 14a4 4 0 1 0 4 4M16 15h3',
  pot: 'M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6ZM3 10h2M19 10h2M9 6c0-1 1-1.5 1-2.5M14 6c0-1 1-1.5 1-2.5',
  laundry: 'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM7 6h.01M10 6h.01M12 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2',
  shuttle: 'M3 17V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v11M16 9h3l2 3v5h-5M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 20h7M3 9h13',
  leaf: 'M4 20C4 11 10 5 20 4c0 10-5 16-14 16H4ZM4 20c2-5 5-8 10-10',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3ZM9 12l2 2 4-4',
  sparkles: 'm12 3 1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM19 15l.9 2.1 2.1.9-2.1.9L19 21l-.9-2.1-2.1-.9 2.1-.9L19 15Z',
  ticket: 'M4 8V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4ZM12 5v2M12 11v2M12 17v2',
}

const FILLED: ReadonlySet<IconName> = new Set<IconName>(['star', 'heart'])

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  /** Fuerza el relleno; por defecto solo `star` y `heart` van rellenos. */
  filled?: boolean
}

export function Icon({ name, size = 20, filled, strokeWidth = 2, ...rest }: IconProps) {
  const isFilled = filled ?? FILLED.has(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} fill={isFilled ? 'currentColor' : 'none'} />
    </svg>
  )
}
