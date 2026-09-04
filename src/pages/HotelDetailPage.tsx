import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import type { Hotel, RoomOption } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { HotelImage } from '@/components/ui/HotelImage'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { StarRating } from '@/components/ui/StarRating'
import { BookingPanel } from '@/components/detail/BookingPanel'
import { getHotelBySlug } from '@/api/hotels'
import { getAmenity } from '@/data/amenities'
import { parseSearchQuery } from '@/lib/searchParams'
import {
  formatDistance,
  formatLongDate,
  formatNumber,
  formatPrice,
  formatRating,
  nightsBetween,
  pluralize,
  ratingLabel,
} from '@/lib/format'

export function HotelDetailPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const query = useMemo(() => parseSearchQuery(searchParams), [searchParams])

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null)

  const nights = nightsBetween(query.checkIn, query.checkOut)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    getHotelBySlug(slug, controller.signal)
      .then((data) => {
        setHotel(data)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'No pudimos cargar el alojamiento.')
        setLoading(false)
      })

    return () => controller.abort()
  }, [slug])

  if (loading) {
    return (
      <div className="container detail-loading" aria-busy="true">
        <div className="skeleton-block detail-skeleton-media" />
        <div className="skeleton-line is-lg" />
        <div className="skeleton-line is-md" />
        <div className="skeleton-line" />
      </div>
    )
  }

  if (error !== null || hotel === null) {
    return (
      <section className="section">
        <div className="container section-inner">
          <span className="eyebrow">Sin resultados</span>
          <h1 className="section-title">No encontramos este alojamiento</h1>
          <p className="section-lede">{error ?? 'El enlace puede estar desactualizado.'}</p>
          <Link to="/hoteles" className="btn btn-primary">
            Volver a la búsqueda
          </Link>
        </div>
      </section>
    )
  }

  const backUrl = `/hoteles?${searchParams.toString()}`
  const cheapestDeal = hotel.deals[0]

  return (
    <article className="detail">
      <div className="container is-wide detail-top">
        <Link to={backUrl} className="arrow-link detail-back">
          <Icon name="arrow-left" size={16} />
          Volver a los resultados
        </Link>
      </div>

      <div className="container is-wide detail-gallery">
        <div className="detail-gallery-main">
          <HotelImage seed={hotel.id} src={hotel.images[0]} alt={`Ilustración de ${hotel.name}`} variant="hero" />
        </div>
        <div className="detail-gallery-side">
          <HotelImage seed={`${hotel.id}-b`} src={hotel.images[1]} alt="" />
          <HotelImage seed={`${hotel.id}-c`} src={hotel.images[2]} alt="" />
        </div>
      </div>

      <div className="container is-wide detail-layout">
        <div className="detail-main">
          <header className="detail-head">
            <div className="detail-head-tags">
              <span className="badge is-soft">{hotel.type}</span>
              {hotel.sustainable && (
                <span className="badge is-green">
                  <Icon name="leaf" size={12} />
                  Sostenible
                </span>
              )}
              {hotel.featured && <span className="badge is-red">Destacado</span>}
            </div>

            <div className="detail-titleline">
              <h1>{hotel.name}</h1>
              <StarRating stars={hotel.stars} size={17} />
            </div>

            <p className="detail-address">
              <Icon name="pin" size={15} />
              {hotel.address} · {formatDistance(hotel.distanceToCenterKm)}
            </p>

            <RatingBadge score={hotel.rating} reviews={hotel.reviewsCount} size="lg" />
          </header>

          <section className="detail-section">
            <h2>Sobre el alojamiento</h2>
            <p className="detail-text">{hotel.description}</p>
            <ul className="detail-highlights">
              {hotel.highlights.map((item) => (
                <li key={item}>
                  <Icon name="check" size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-section">
            <h2>Servicios</h2>
            <ul className="detail-amenities">
              {hotel.amenities.map((id) => {
                const amenity = getAmenity(id)
                return (
                  <li key={id}>
                    <Icon name={amenity.icon} size={18} />
                    {amenity.label}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="detail-section" id="habitaciones">
            <h2>Habitaciones disponibles</h2>
            <div className="room-list">
              {hotel.rooms.map((room) => (
                <div key={room.id} className="room-row">
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p className="room-desc">{room.description}</p>
                    <ul className="room-facts">
                      <li>
                        <Icon name="users" size={14} />
                        {room.capacity} {pluralize(room.capacity, 'huésped', 'huéspedes')}
                      </li>
                      <li>{room.beds}</li>
                      <li>{room.sizeM2} m²</li>
                    </ul>
                    <ul className="room-perks">
                      <li className={room.refundable ? 'is-ok' : 'is-off'}>
                        <Icon name={room.refundable ? 'check' : 'close'} size={13} />
                        {room.refundable ? 'Cancelación gratis' : 'Tarifa no reembolsable'}
                      </li>
                      {room.breakfastIncluded && (
                        <li className="is-ok">
                          <Icon name="check" size={13} />
                          Desayuno incluido
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="room-action">
                    <p className="room-price">
                      {formatPrice(room.pricePerNight)}
                      <span>/noche</span>
                    </p>
                    <p className="room-total">
                      {formatPrice(room.pricePerNight * nights)} por {nights}{' '}
                      {pluralize(nights, 'noche', 'noches')}
                    </p>
                    <p className="room-stock">
                      Quedan {room.available} {pluralize(room.available, 'unidad', 'unidades')}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedRoom(room)}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>Comparar ofertas</h2>
            <p className="detail-text">
              Precio por noche del mismo alojamiento en distintos proveedores.
            </p>
            <ul className="deal-list">
              {hotel.deals.map((deal, index) => (
                <li key={deal.provider} className={`deal-row ${index === 0 ? 'is-best' : ''}`}>
                  <div className="deal-provider">
                    <span className="deal-name">{deal.provider}</span>
                    <span className="deal-perks">
                      {deal.freeCancellation && <span className="chip">Cancelación gratis</span>}
                      {deal.breakfastIncluded && <span className="chip">Desayuno</span>}
                      {deal.payAtProperty && <span className="chip">Paga en el hotel</span>}
                    </span>
                  </div>
                  <div className="deal-price">
                    {index === 0 && <span className="badge is-yellow">Mejor precio</span>}
                    <strong>{formatPrice(deal.pricePerNight)}</strong>
                    <span>/noche</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-section">
            <h2>
              Opiniones de huéspedes
              <span className="detail-section-meta">
                {formatRating(hotel.rating)}/10 · {ratingLabel(hotel.rating)} ·{' '}
                {formatNumber(hotel.reviewsCount)} opiniones
              </span>
            </h2>
            <div className="review-grid">
              {hotel.reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <header>
                    <span className="review-score">{formatRating(review.score)}</span>
                    <div>
                      <p className="review-author">{review.author}</p>
                      <p className="review-meta">
                        {review.country} · {formatLongDate(review.date)}
                      </p>
                    </div>
                  </header>
                  <h3>{review.title}</h3>
                  <p>{review.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>Condiciones</h2>
            <ul className="policy-list">
              <li>
                <Icon name="clock" size={17} />
                <span>
                  <strong>Check-in</strong> desde las {hotel.checkIn}
                </span>
              </li>
              <li>
                <Icon name="clock" size={17} />
                <span>
                  <strong>Check-out</strong> hasta las {hotel.checkOut}
                </span>
              </li>
              <li>
                <Icon name="ticket" size={17} />
                <span>
                  <strong>Pago</strong> con tarjeta de crédito o débito al confirmar
                </span>
              </li>
              <li>
                <Icon name="shield" size={17} />
                <span>
                  <strong>Documentos</strong> cédula o pasaporte al llegar
                </span>
              </li>
            </ul>
          </section>
        </div>

        <aside className="detail-aside">
          <div className="booking-box">
            <p className="booking-box-label">Desde</p>
            <p className="booking-box-price">
              {formatPrice(hotel.pricePerNight)}
              <span>/noche</span>
            </p>
            {hotel.originalPricePerNight !== null && (
              <p className="booking-box-strike">{formatPrice(hotel.originalPricePerNight)}</p>
            )}

            <dl className="booking-box-dates">
              <div>
                <dt>Entrada</dt>
                <dd>{formatLongDate(query.checkIn)}</dd>
              </div>
              <div>
                <dt>Salida</dt>
                <dd>{formatLongDate(query.checkOut)}</dd>
              </div>
              <div>
                <dt>Huéspedes</dt>
                <dd>
                  {query.guests.adults + query.guests.children} en {query.guests.rooms}{' '}
                  {pluralize(query.guests.rooms, 'habitación', 'habitaciones')}
                </dd>
              </div>
            </dl>

            <p className="booking-box-total">
              <span>
                {nights} {pluralize(nights, 'noche', 'noches')}
              </span>
              <strong>{formatPrice(hotel.pricePerNight * nights)}</strong>
            </p>

            <a href="#habitaciones" className="btn btn-primary btn-block">
              Elegir habitación
            </a>

            {cheapestDeal && (
              <p className="booking-box-note">
                Mejor precio encontrado en <strong>{cheapestDeal.provider}</strong>.
              </p>
            )}
          </div>
        </aside>
      </div>

      {selectedRoom && (
        <BookingPanel
          hotel={hotel}
          room={selectedRoom}
          checkIn={query.checkIn}
          checkOut={query.checkOut}
          guests={query.guests}
          nights={nights}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </article>
  )
}
