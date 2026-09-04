import { Icon } from '@/components/ui/Icon'

interface EmptyStateProps {
  onReset: () => void
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="empty-state card">
      <span className="card-icon is-blue">
        <Icon name="search" size={22} />
      </span>
      <h3>No encontramos alojamientos con esos filtros</h3>
      <p>
        Prueba ampliando el rango de precios, quitando algún servicio obligatorio o incluyendo más
        cerros en la búsqueda.
      </p>
      <button type="button" className="btn btn-primary btn-sm" onClick={onReset}>
        Limpiar filtros
      </button>
    </div>
  )
}
