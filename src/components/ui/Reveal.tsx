import type { ReactNode } from 'react'
import type { Variants } from 'framer-motion'
import { motion, useReducedMotion } from 'framer-motion'

type RevealVariant = 'fade-up' | 'fade' | 'scale'

const VARIANTS: Record<RevealVariant, Variants> = {
  'fade-up': { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
}

const VIEWPORT = { once: true, margin: '-60px' } as const

interface RevealProps {
  children: ReactNode
  as?: RevealVariant
  delay?: number
  className?: string
  /**
   * Anima al montar en vez de esperar al IntersectionObserver.
   * Obligatorio para el contenido visible sin hacer scroll (el hero): si el
   * observer no llega a dispararse, ese bloque se quedaria invisible.
   */
  immediate?: boolean
}

export function Reveal({ children, as = 'fade-up', delay = 0, className, immediate = false }: RevealProps) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  const trigger = immediate
    ? { animate: 'visible' as const }
    : { whileInView: 'visible' as const, viewport: VIEWPORT }

  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={VARIANTS[as]}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...trigger}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  stagger?: number
  immediate?: boolean
}

/** Contenedor que escalona la entrada de sus hijos `<StaggerItem>`. */
export function Stagger({ children, className, stagger = 0.08, immediate = false }: StaggerProps) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  const trigger = immediate
    ? { animate: 'visible' as const }
    : { whileInView: 'visible' as const, viewport: VIEWPORT }

  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
      {...trigger}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
