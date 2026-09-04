import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Vuelve arriba al cambiar de ruta, salvo cuando la URL trae un ancla. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash !== '') return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}
