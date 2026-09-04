import { Icon } from '@/components/ui/Icon'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/** Ventana de hasta 5 páginas centrada en la actual. */
function pageWindow(page: number, pageCount: number): number[] {
  const size = Math.min(5, pageCount)
  let start = Math.max(1, page - 2)
  if (start + size - 1 > pageCount) start = pageCount - size + 1
  return Array.from({ length: size }, (_, i) => start + i)
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav className="pagination" aria-label="Paginación de resultados">
      <button
        type="button"
        className="pagination-arrow"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <Icon name="arrow-left" size={16} />
      </button>

      {pageWindow(page, pageCount).map((n) => (
        <button
          key={n}
          type="button"
          className={`pagination-page ${n === page ? 'is-active' : ''}`}
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        className="pagination-arrow"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        aria-label="Página siguiente"
      >
        <Icon name="arrow-right" size={16} />
      </button>
    </nav>
  )
}
