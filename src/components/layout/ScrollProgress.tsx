import { motion, useScroll, useSpring } from 'framer-motion'

/** Barra fina de progreso de lectura, anclada al borde superior. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24 })

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
