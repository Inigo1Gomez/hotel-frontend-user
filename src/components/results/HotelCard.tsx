import { Link } from 'react-router-dom'
import type { Hotel } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { HotelImage } from '@/components/ui/HotelImage'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { StarRating } from '@/components/ui/StarRating'
import { getAmenity } from '@/data/amenities'
import { formatDistance, formatPrice, pluralize } from '@/lib/format'

interface HotelCardProps {
  hotel: Hotel
  /** Noches de la búsqueda actual, para mostrar el total además del precio por noche. */
  nights: number
  /** Query string a arrastrar al detalle, para no perder fechas ni huéspedes. */
  searchParams?: string
}

export function HotelCard({ hotel, nights, searchParams }: HotelCardProps) {
  const detailUrl = `/hotel/${hotel.slug}${searchParams ? `?${searchParams}` : ''}`
  const total = hotel.pricePerNight * nights
  const discount =
    hotel.originalPricePerNight === null
      ? null
      : Math.round((1 - hotel.pricePerNight / hotel.originalPricePerNight) * 100)
  const visibleAmenities = hotel.amenities.slice(0, 4)
  const extraAmenities = hotel.amenities.length - visibleAmenities.length

  return (
    <article className="hotel-card">
      <div className="hotel-card-media">
        <HotelImage seed={hotel.id} src={hotel.images[0]} alt={`Ilustración de ${hotel.name}`} />
        <div className="hotel-card-tags">
          {hotel.featured && <span className="badge is-red">Destacado</span>}
          {hotel.sustainable && (
            <span className="badge is-green">
              <Icon name="leaf" size={12} />
              Sostenible
            </span>
          )}
          {discount !== null && discount > 0 && <span className="badge is-yellow">−{discount} %</span>}
        </div>
      </div>

      <div className="hotel-card-body">
        <div className="hotel-card-head">
          <div>
            <div className="hotel-card-titleline">
              <h3 className="hotel-card-name">
                <Link to={detailUrl}>{hotel.name}</Link>
              </h3>
              <StarRating stars={hotel.stars} />
            </div>
            <p className="hotel-card-location">
              <Icon name="pin" size={14} />
              {hotel.neighborhood} · {formatDistance(hotel.distanceToCenterKm)}
            </p>
          </div>
          <RatingBadge score={hotel.rating} reviews={hotel.reviewsCount} />
        </div>

        <p className="hotel-card-desc">{hotel.shortDescription}</p>

        <ul className="hotel-card-amenities">
          {visibleAmenities.map((id) => {
            const amenity = getAmenity(id)
            return (
              <li key={id} className="chip">
                <Icon name={amenity.icon} size={13} />
                {amenity.label}
              </li>
            )
          })}
          {extraAmenities > 0 && <li className="chip">+{extraAmenities} más</li>}
        </ul>
      </div>

      <div className="hotel-card-aside">
        <p className="hotel-card-deals">
          {hotel.deals.length} {pluralize(hotel.deals.length, 'oferta', 'ofertas')}
        </p>
        {hotel.originalPricePerNight !== null && (
          <p className="hotel-card-strike">{formatPrice(hotel.originalPricePerNight)}</p>
        )}
        <p className="hotel-card-price">
          {formatPrice(hotel.pricePerNight)}
          <span>/noche</span>
        </p>
        <p className="hotel-card-total">
          {formatPrice(total)} por {nights} {pluralize(nights, 'noche', 'noches')}
        </p>
        <Link to={detailUrl} className="btn btn-primary btn-sm hotel-card-cta">
          Ver oferta
          <Icon name="arrow-right" size={15} />
        </Link>
        {hotel.deals.some((deal) => deal.freeCancellation) && (
          <p className="hotel-card-perk">
            <Icon name="check" size={13} />
            Cancelación gratis
          </p>
        )}
      </div>
    </article>
  )
}

/** Marcador de posición mientras se resuelve la búsqueda. */
export function HotelCardSkeleton() {
  return (
    <div className="hotel-card is-skeleton" aria-hidden="true">
      <div className="hotel-card-media skeleton-block" />
      <div className="hotel-card-body">
        <div className="skeleton-line is-lg" />
        <div className="skeleton-line is-sm" />
        <div className="skeleton-line" />
        <div className="skeleton-line is-md" />
      </div>
      <div className="hotel-card-aside">
        <div className="skeleton-line is-sm" />
        <div className="skeleton-line is-lg" />
        <div className="skeleton-line is-pill" />
      </div>
    </div>
  )
}
