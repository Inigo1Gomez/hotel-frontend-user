import type { Amenity, AmenityId } from '@/types/hotel'
import type { IconName } from '@/components/ui/Icon'

/** `Amenity` con el icono acotado al set disponible en la UI. */
export interface AmenityMeta extends Amenity {
  icon: IconName
}

export const AMENITIES: AmenityMeta[] = [
  { id: 'wifi', label: 'WiFi gratis', icon: 'wifi' },
  { id: 'desayuno', label: 'Desayuno incluido', icon: 'coffee' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'car' },
  { id: 'vista-mar', label: 'Vista al mar', icon: 'wave' },
  { id: 'terraza', label: 'Terraza', icon: 'sun' },
  { id: 'restaurante', label: 'Restaurante', icon: 'utensils' },
  { id: 'bar', label: 'Bar', icon: 'glass' },
  { id: 'spa', label: 'Spa', icon: 'spa' },
  { id: 'piscina', label: 'Piscina', icon: 'pool' },
  { id: 'gimnasio', label: 'Gimnasio', icon: 'dumbbell' },
  { id: 'mascotas', label: 'Admite mascotas', icon: 'paw' },
  { id: 'aire', label: 'Aire acondicionado', icon: 'snow' },
  { id: 'calefaccion', label: 'Calefacción', icon: 'flame' },
  { id: 'accesible', label: 'Accesibilidad', icon: 'accessible' },
  { id: 'cocina', label: 'Cocina equipada', icon: 'pot' },
  { id: 'lavanderia', label: 'Lavandería', icon: 'laundry' },
  { id: 'recepcion-24h', label: 'Recepción 24 h', icon: 'clock' },
  { id: 'traslado', label: 'Traslado aeropuerto', icon: 'shuttle' },
]

const BY_ID = new Map<AmenityId, AmenityMeta>(AMENITIES.map((a) => [a.id, a]))

export function getAmenity(id: AmenityId): AmenityMeta {
  return BY_ID.get(id) ?? { id, label: id, icon: 'check' }
}

/** Servicios ofrecidos como filtro rápido, en orden de relevancia para Valparaíso. */
export const POPULAR_AMENITIES: AmenityId[] = [
  'wifi',
  'desayuno',
  'vista-mar',
  'terraza',
  'estacionamiento',
  'mascotas',
  'restaurante',
  'spa',
]
