import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { NEIGHBORHOODS } from '@/data/neighborhoods'

const HELP_LINKS = [
  { label: 'Cómo reservar', to: '/ayuda#reservar' },
  { label: 'Política de cancelación', to: '/ayuda#cancelacion' },
  { label: 'Preguntas frecuentes', to: '/ayuda#faq' },
  { label: 'Contacto', to: '/ayuda#contacto' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo />
          <p className="footer-tagline">
            Alojamientos de los cerros de Valparaíso, comparados en un solo lugar.
          </p>
        </div>

        <nav className="footer-cols" aria-label="Enlaces del pie de página">
          <div className="footer-col">
            <h3>Barrios</h3>
            <ul>
              {NEIGHBORHOODS.slice(0, 5).map((n) => (
                <li key={n.name}>
                  <Link to={`/hoteles?destino=${encodeURIComponent('Valparaíso, Chile')}&barrio=${encodeURIComponent(n.name)}`}>
                    {n.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Ayuda</h3>
            <ul>
              {HELP_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Explorar</h3>
            <ul>
              <li>
                <Link to="/hoteles">Todos los alojamientos</Link>
              </li>
              <li>
                <Link to="/hoteles?orden=precio-asc">Los más económicos</Link>
              </li>
              <li>
                <Link to="/hoteles?orden=rating">Mejor puntuados</Link>
              </li>
              <li>
                <Link to="/hoteles?servicio=vista-mar">Con vista al mar</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="container footer-legal">
        <p>© {year} Portal Valparaíso · Frontend de usuario</p>
        <p className="footer-note">
          Proyecto de demostración: los precios y la disponibilidad son ficticios.
        </p>
      </div>
    </footer>
  )
}
