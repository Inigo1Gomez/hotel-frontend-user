import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'

export function NotFoundPage() {
  return (
    <section className="section">
      <div className="container section-inner not-found">
        <span className="eyebrow">Error 404</span>
        <h1 className="section-title">
          Esta página se <span className="hl-red">perdió en los cerros</span>
        </h1>
        <p className="section-lede">
          La dirección que buscas no existe o el alojamiento ya no está publicado.
        </p>
        <Link to="/hoteles" className="btn btn-primary">
          <Icon name="search" size={18} />
          Ver alojamientos
        </Link>
      </div>
    </section>
  )
}
