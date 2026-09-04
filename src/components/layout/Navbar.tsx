import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { Icon } from '@/components/ui/Icon'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useScrolled } from '@/hooks/useScrolled'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

/** Secciones ancladas de la portada, con scroll-spy. */
const HOME_SECTIONS = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'barrios', label: 'Barrios' },
  { id: 'experiencias', label: 'Experiencias' },
  { id: 'porque', label: 'Por qué aquí' },
  { id: 'opiniones', label: 'Opiniones' },
]

/** Rutas visibles cuando no estamos en la portada. */
const ROUTE_LINKS = [
  { to: '/hoteles', label: 'Alojamientos' },
  { to: '/ayuda', label: 'Ayuda' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled(24)
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const activeSection = useScrollSpy(isHome ? HOME_SECTIONS.map((s) => s.id) : [])

  useLockBodyScroll(menuOpen)

  const close = () => setMenuOpen(false)

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container is-wide navbar-inner">
        <Link to="/" className="navbar-brand" onClick={close} aria-label="Portal Valparaíso, ir al inicio">
          <Logo />
        </Link>

        <nav className="navbar-links" aria-label="Navegación principal">
          {isHome
            ? HOME_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={activeSection === section.id ? 'is-active' : ''}
                >
                  {section.label}
                </a>
              ))
            : ROUTE_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? 'is-active' : '')}
                >
                  {link.label}
                </NavLink>
              ))}
        </nav>

        <Link to="/hoteles" className="btn btn-primary btn-sm navbar-cta">
          <Icon name="search" size={16} />
          Buscar hotel
        </Link>

        <button
          type="button"
          className={`navbar-burger ${menuOpen ? 'is-open' : ''}`}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`navbar-mobile ${menuOpen ? 'is-open' : ''}`}>
        {isHome
          ? HOME_SECTIONS.map((section) => (
              <a key={section.id} href={`#${section.id}`} onClick={close}>
                {section.label}
              </a>
            ))
          : ROUTE_LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={close}>
                {link.label}
              </Link>
            ))}
        <Link to="/hoteles" className="btn btn-primary" onClick={close}>
          Buscar hotel
        </Link>
      </div>
    </header>
  )
}
