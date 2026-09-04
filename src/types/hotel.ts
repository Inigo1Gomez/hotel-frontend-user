/** Modelo de dominio del frontend de usuario. */

/** Cerros y barrios de Valparaiso usados como filtro de ubicacion. */
export type Neighborhood =
  | 'Cerro Alegre'
  | 'Cerro Concepción'
  | 'Cerro Bellavista'
  | 'Cerro Cárcel'
  | 'Cerro Panteón'
  | 'Cerro Artillería'
  | 'Playa Ancha'
  | 'El Plan'
  | 'El Almendral'
  | 'Barón'

export type PropertyType = 'Hotel' | 'Hotel boutique' | 'Hostal' | 'Bed & Breakfast' | 'Apartamento' | 'Cabaña'

export type AmenityId =
  | 'wifi'
  | 'desayuno'
  | 'estacionamiento'
  | 'vista-mar'
  | 'terraza'
  | 'restaurante'
  | 'bar'
  | 'spa'
  | 'piscina'
  | 'gimnasio'
  | 'mascotas'
  | 'aire'
  | 'calefaccion'
  | 'accesible'
  | 'cocina'
  | 'lavanderia'
  | 'recepcion-24h'
  | 'traslado'

export interface Amenity {
  id: AmenityId
  label: string
  /** Nombre del icono en el set local (`components/ui/Icon`). */
  icon: string
}

/** Oferta de un proveedor para una habitacion, al estilo de un metabuscador. */
export interface Deal {
  provider: string
  pricePerNight: number
  freeCancellation: boolean
  breakfastIncluded: boolean
  payAtProperty: boolean
}

export interface RoomOption {
  id: string
  name: string
  description: string
  capacity: number
  beds: string
  sizeM2: number
  pricePerNight: number
  refundable: boolean
  breakfastIncluded: boolean
  available: number
}

export interface Review {
  id: string
  author: string
  country: string
  score: number
  date: string
  title: string
  body: string
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface Hotel {
  id: string
  slug: string
  name: string
  type: PropertyType
  /** Estrellas oficiales (0 = sin categorizar, tipico en hostales). */
  stars: number
  neighborhood: Neighborhood
  address: string
  coords: Coordinates
  /** Distancia caminando al Muelle Prat / Plaza Sotomayor, en km. */
  distanceToCenterKm: number
  /** Puntaje de huespedes sobre 10. */
  rating: number
  reviewsCount: number
  /** Precio mas bajo por noche, en pesos chilenos. */
  pricePerNight: number
  /** Precio de lista para mostrar descuento; null si no hay rebaja. */
  originalPricePerNight: number | null
  currency: 'CLP'
  amenities: AmenityId[]
  images: string[]
  shortDescription: string
  description: string
  highlights: string[]
  deals: Deal[]
  rooms: RoomOption[]
  reviews: Review[]
  checkIn: string
  checkOut: string
  sustainable: boolean
  featured: boolean
}

/* ---------- busqueda ---------- */

export type SortKey = 'recomendado' | 'precio-asc' | 'precio-desc' | 'rating' | 'distancia' | 'estrellas'

export interface Guests {
  adults: number
  children: number
  rooms: number
}

export interface SearchCriteria {
  destination: string
  checkIn: string
  checkOut: string
  guests: Guests
}

export interface HotelFilters {
  priceMin: number
  priceMax: number
  stars: number[]
  minRating: number
  neighborhoods: Neighborhood[]
  types: PropertyType[]
  amenities: AmenityId[]
  freeCancellation: boolean
  breakfastIncluded: boolean
  query: string
}

export interface SearchQuery extends SearchCriteria {
  filters: HotelFilters
  sort: SortKey
  page: number
  pageSize: number
}

export interface SearchResult {
  hotels: Hotel[]
  total: number
  page: number
  pageSize: number
  /** Rango de precios de todo el catalogo, para acotar el slider. */
  priceBounds: { min: number; max: number }
}
