interface LogoProps {
  className?: string
  height?: number
}

/** Marca del portal: la casa del cerro sobre la línea de la bahía. */
export function Logo({ className, height = 30 }: LogoProps) {
  return (
    <span className={`brand ${className ?? ''}`.trim()}>
      <svg height={height} viewBox="0 0 40 40" aria-hidden="true" className="brand-mark">
        <rect width="40" height="40" rx="9" fill="#0062E3" />
        <path
          d="M9 29V18.5L20 11l11 7.5V29"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M16.5 29v-6.5h7V29" fill="none" stroke="#6CC7F5" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M7 32.5h26" stroke="#6CC7F5" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="brand-text">
        Portal <span className="brand-text-accent">Valparaíso</span>
      </span>
    </span>
  )
}
