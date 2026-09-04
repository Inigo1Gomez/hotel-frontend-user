import { formatNumber, formatRating, ratingLabel } from '@/lib/format'

interface RatingBadgeProps {
  score: number
  reviews?: number
  /** `sm` para tarjetas de resultados, `lg` para la ficha del alojamiento. */
  size?: 'sm' | 'lg'
}

export function RatingBadge({ score, reviews, size = 'sm' }: RatingBadgeProps) {
  return (
    <div className={`rating-badge is-${size}`}>
      <span className="rating-badge-score" aria-label={`Puntaje ${formatRating(score)} de 10`}>
        {formatRating(score)}
      </span>
      <span className="rating-badge-meta">
        <span className="rating-badge-label">{ratingLabel(score)}</span>
        {reviews !== undefined && (
          <span className="rating-badge-count">{formatNumber(reviews)} opiniones</span>
        )}
      </span>
    </div>
  )
}
