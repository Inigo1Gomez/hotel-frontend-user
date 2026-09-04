import { Icon } from './Icon'

interface StarRatingProps {
  /** Estrellas oficiales del establecimiento (0 = sin categorizar). */
  stars: number
  size?: number
}

export function StarRating({ stars, size = 14 }: StarRatingProps) {
  if (stars <= 0) return null

  return (
    <span className="star-rating" aria-label={`${stars} estrellas`}>
      {Array.from({ length: stars }, (_, i) => (
        <Icon key={i} name="star" size={size} />
      ))}
    </span>
  )
}
