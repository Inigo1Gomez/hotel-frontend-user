import type {
  AmenityId,
  Deal,
  Hotel,
  Neighborhood,
  PropertyType,
  Review,
  RoomOption,
} from '@/types/hotel'

/**
 * Dataset de demostración del frontend de usuario.
 *
 * Los alojamientos son establecimientos reales de Valparaíso, pero los precios,
 * puntajes, disponibilidad y reseñas son FICTICIOS: existen solo para poder
 * desarrollar la interfaz sin depender del microservicio de reservas.
 * Al definir VITE_API_URL el cliente deja de usar este archivo.
 */

interface HotelSeed {
  name: string
  type: PropertyType
  stars: number
  neighborhood: Neighborhood
  address: string
  lat: number
  lng: number
  distanceToCenterKm: number
  rating: number
  reviewsCount: number
  pricePerNight: number
  discountPct?: number
  amenities: AmenityId[]
  shortDescription: string
  description: string
  highlights: string[]
  sustainable?: boolean
  featured?: boolean
}

const SEEDS: HotelSeed[] = [
  {
    name: 'Palacio Astoreca',
    type: 'Hotel boutique',
    stars: 5,
    neighborhood: 'Cerro Alegre',
    address: 'Montealegre 149, Cerro Alegre',
    lat: -33.0409,
    lng: -71.6296,
    distanceToCenterKm: 0.6,
    rating: 9.4,
    reviewsCount: 1284,
    pricePerNight: 248000,
    discountPct: 15,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'restaurante', 'bar', 'spa', 'piscina', 'terraza', 'recepcion-24h', 'calefaccion'],
    shortDescription: 'Palacio de 1923 restaurado, con piscina temperada y restaurante de autor.',
    description:
      'Ocupa un palacete de 1923 en pleno Cerro Alegre, restaurado conservando pisos de roble, vitrales y molduras originales. Suma piscina temperada bajo techo, spa, biblioteca con chimenea y un restaurante especializado en productos del Pacífico. Las habitaciones frontales miran directo a la bahía.',
    highlights: ['Piscina temperada y spa', 'Restaurante de autor en el hotel', 'Edificio patrimonial de 1923'],
    featured: true,
  },
  {
    name: 'Hotel Casa Higueras',
    type: 'Hotel boutique',
    stars: 5,
    neighborhood: 'Cerro Alegre',
    address: 'Higuera 133, Cerro Alegre',
    lat: -33.0396,
    lng: -71.6314,
    distanceToCenterKm: 0.7,
    rating: 9.2,
    reviewsCount: 1976,
    pricePerNight: 215000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'restaurante', 'bar', 'spa', 'piscina', 'terraza', 'estacionamiento', 'calefaccion'],
    shortDescription: 'Casona de los años 30 con terrazas escalonadas sobre la bahía.',
    description:
      'Una casona art déco de los años 30 convertida en hotel, con jardines en terrazas que bajan por el cerro hasta una piscina con vista al puerto. Su restaurante es de los mejores de la ciudad y la terraza superior es un clásico para el atardecer.',
    highlights: ['Jardines en terrazas', 'Piscina con vista al puerto', 'Restaurante en el hotel'],
    featured: true,
  },
  {
    name: 'Zerohotel',
    type: 'Hotel boutique',
    stars: 4,
    neighborhood: 'Cerro Alegre',
    address: 'Lautaro Rosas 343, Cerro Alegre',
    lat: -33.0403,
    lng: -71.6306,
    distanceToCenterKm: 0.65,
    rating: 9,
    reviewsCount: 842,
    pricePerNight: 168000,
    discountPct: 10,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'bar', 'calefaccion', 'recepcion-24h'],
    shortDescription: 'Casa patrimonial con nueve habitaciones y terraza panorámica.',
    description:
      'Nueve habitaciones en una casa patrimonial de fachada rosada sobre Lautaro Rosas. El desayuno se sirve en la terraza mirando la bahía y el trato es muy personal: el equipo arma recorridos a pie por los cerros según lo que te interese.',
    highlights: ['Solo 9 habitaciones', 'Terraza panorámica', 'Recorridos guiados por los cerros'],
    featured: true,
  },
  {
    name: 'Hotel Fauna',
    type: 'Hotel boutique',
    stars: 4,
    neighborhood: 'Cerro Alegre',
    address: 'Pasaje Dimalow 166, Cerro Alegre',
    lat: -33.0411,
    lng: -71.6287,
    distanceToCenterKm: 0.55,
    rating: 8.8,
    reviewsCount: 1103,
    pricePerNight: 142000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'restaurante', 'bar', 'terraza', 'calefaccion'],
    shortDescription: 'Terraza-bar con la vista más fotografiada del Pasaje Dimalow.',
    description:
      'Sobre el Pasaje Dimalow, con una terraza-bar que es punto de encuentro de la ciudad al atardecer. Habitaciones sobrias en tonos claros, varias con ventanal a la bahía, y una cocina que trabaja con la pesca del día.',
    highlights: ['Terraza-bar abierta al público', 'Sobre el Paseo Dimalow', 'Cocina con pesca del día'],
  },
  {
    name: 'Winebox Valparaíso',
    type: 'Hotel boutique',
    stars: 3,
    neighborhood: 'Cerro Alegre',
    address: 'Av. Baquedano 763, Cerro Alegre',
    lat: -33.0442,
    lng: -71.6262,
    distanceToCenterKm: 1.1,
    rating: 8.9,
    reviewsCount: 967,
    pricePerNight: 118000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'bar', 'terraza', 'restaurante', 'calefaccion'],
    shortDescription: 'Hotel-viña construido con 25 contenedores reciclados.',
    description:
      'Veinticinco contenedores marítimos reciclados apilados en el cerro, con una viña urbana propia y un wine bar en la azotea que embotella su propia línea de vinos naturales. Cada habitación es un contenedor intervenido, con vista directa al puerto.',
    highlights: ['Arquitectura en contenedores', 'Viña urbana y wine bar', 'Vinos naturales de producción propia'],
    sustainable: true,
    featured: true,
  },
  {
    name: 'Casa Galos Hotel & Lofts',
    type: 'Hotel boutique',
    stars: 4,
    neighborhood: 'Cerro Alegre',
    address: 'Almirante Montt 429, Cerro Alegre',
    lat: -33.0401,
    lng: -71.6289,
    distanceToCenterKm: 0.6,
    rating: 8.6,
    reviewsCount: 654,
    pricePerNight: 132000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'cocina', 'calefaccion', 'lavanderia'],
    shortDescription: 'Lofts con cocina y vista, en una casa de 1900 restaurada.',
    description:
      'Casa de 1900 dividida en lofts amplios con cocina equipada, pensados para estadías de varios días. Escaleras de madera originales, techos altos y una terraza común que mira al Muelle Prat.',
    highlights: ['Lofts con cocina', 'Ideal para estadías largas', 'Casa restaurada de 1900'],
  },
  {
    name: 'Hotel Boutique Acontraluz',
    type: 'Hotel boutique',
    stars: 4,
    neighborhood: 'Cerro Alegre',
    address: 'Papudo 612, Cerro Alegre',
    lat: -33.0389,
    lng: -71.6301,
    distanceToCenterKm: 0.75,
    rating: 8.7,
    reviewsCount: 512,
    pricePerNight: 126000,
    discountPct: 12,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'bar', 'calefaccion', 'mascotas'],
    shortDescription: 'Ocho habitaciones tranquilas con desayuno casero en la terraza.',
    description:
      'Un hotel pequeño y silencioso, algo apartado del circuito nocturno de Almirante Montt. Ocho habitaciones, desayuno casero con pan amasado y una terraza de madera orientada al poniente.',
    highlights: ['Zona tranquila del cerro', 'Desayuno casero', 'Admite mascotas'],
  },
  {
    name: 'Hotel Somerscales',
    type: 'Hotel boutique',
    stars: 4,
    neighborhood: 'Cerro Alegre',
    address: 'San Enrique 446, Cerro Alegre',
    lat: -33.0394,
    lng: -71.6296,
    distanceToCenterKm: 0.7,
    rating: 8.5,
    reviewsCount: 738,
    pricePerNight: 121000,
    amenities: ['wifi', 'desayuno', 'terraza', 'bar', 'calefaccion', 'estacionamiento'],
    shortDescription: 'La casa del pintor Thomas Somerscales, hoy hotel de ocho habitaciones.',
    description:
      'La casa del pintor inglés Thomas Somerscales, declarada monumento, convertida en hotel con ocho habitaciones. Conserva la escalera de mármol, los pisos de pino oregón y una sala de estar con vitrales.',
    highlights: ['Monumento histórico', 'Vitrales y pino oregón originales', 'A pasos del Paseo Yugoslavo'],
  },
  {
    name: 'Hotel Manoir Atkinson',
    type: 'Bed & Breakfast',
    stars: 3,
    neighborhood: 'Cerro Concepción',
    address: 'Paseo Atkinson 165, Cerro Concepción',
    lat: -33.0395,
    lng: -71.6272,
    distanceToCenterKm: 0.5,
    rating: 9.1,
    reviewsCount: 891,
    pricePerNight: 98000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'calefaccion'],
    shortDescription: 'Casa inglesa sobre el Paseo Atkinson, con desayuno frente a la bahía.',
    description:
      'Una casa de estilo inglés justo sobre el Paseo Atkinson, con balcones que dan de frente a la bahía. El desayuno se sirve en un comedor con ventanales al puerto y el ascensor Concepción queda a media cuadra.',
    highlights: ['Sobre el Paseo Atkinson', 'Balcones a la bahía', 'A pasos del ascensor Concepción'],
    featured: true,
  },
  {
    name: 'Cirilo Armstrong Hotel Boutique',
    type: 'Hotel boutique',
    stars: 4,
    neighborhood: 'Cerro Concepción',
    address: 'Cirilo Armstrong 61, Cerro Concepción',
    lat: -33.0388,
    lng: -71.6265,
    distanceToCenterKm: 0.45,
    rating: 8.9,
    reviewsCount: 423,
    pricePerNight: 139000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'bar', 'calefaccion', 'recepcion-24h'],
    shortDescription: 'Diseño contemporáneo en una calle silenciosa del cerro.',
    description:
      'Interiores contemporáneos en una calle interior de Cerro Concepción, lejos del ruido pero a cinco minutos a pie del Paseo Gervasoni. Habitaciones con ventanal de piso a techo y una azotea de uso común.',
    highlights: ['Calle silenciosa', 'Ventanales de piso a techo', 'Azotea de uso común'],
  },
  {
    name: 'Hotel Brighton',
    type: 'Hotel',
    stars: 3,
    neighborhood: 'Cerro Concepción',
    address: 'Paseo Atkinson 151, Cerro Concepción',
    lat: -33.0397,
    lng: -71.627,
    distanceToCenterKm: 0.5,
    rating: 8.3,
    reviewsCount: 1442,
    pricePerNight: 86000,
    discountPct: 8,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'restaurante', 'bar', 'terraza'],
    shortDescription: 'La casa amarilla victoriana con la terraza más conocida del cerro.',
    description:
      'La icónica casa victoriana amarilla del Paseo Atkinson. Su terraza-restaurante con música en vivo los fines de semana es una institución porteña; conviene pedir habitación interior si buscas silencio.',
    highlights: ['Ícono victoriano de Valparaíso', 'Terraza con música en vivo', 'Vista frontal a la bahía'],
  },
  {
    name: 'Hotel Da Vinci',
    type: 'Hotel',
    stars: 3,
    neighborhood: 'Cerro Concepción',
    address: 'Urriola 426, Cerro Concepción',
    lat: -33.0402,
    lng: -71.6262,
    distanceToCenterKm: 0.4,
    rating: 8.4,
    reviewsCount: 617,
    pricePerNight: 79000,
    amenities: ['wifi', 'desayuno', 'terraza', 'calefaccion', 'lavanderia'],
    shortDescription: 'Buena relación precio-ubicación sobre la subida Urriola.',
    description:
      'Sobre la subida Urriola, a mitad de camino entre el plan y los paseos. Habitaciones simples y limpias, desayuno abundante y una relación precio-ubicación difícil de superar dentro del casco histórico.',
    highlights: ['Precio-ubicación imbatible', 'Sobre la subida Urriola', 'Desayuno abundante'],
  },
  {
    name: 'Augusta Hotel',
    type: 'Hotel',
    stars: 3,
    neighborhood: 'Cerro Concepción',
    address: 'Templeman 183, Cerro Concepción',
    lat: -33.0392,
    lng: -71.6268,
    distanceToCenterKm: 0.48,
    rating: 8.2,
    reviewsCount: 389,
    pricePerNight: 74000,
    amenities: ['wifi', 'desayuno', 'calefaccion', 'lavanderia', 'recepcion-24h'],
    shortDescription: 'Hotel familiar en calle Templeman, junto a la Iglesia Luterana.',
    description:
      'Un hotel familiar de trato cercano en Templeman, a media cuadra de la Iglesia Luterana. Sin lujos, pero con habitaciones cálidas en invierno y un desayuno que se agradece antes de subir cerros.',
    highlights: ['Atención familiar', 'Junto a la Iglesia Luterana', 'Calefacción en todas las habitaciones'],
  },
  {
    name: 'Hotel Ultramar',
    type: 'Hotel',
    stars: 3,
    neighborhood: 'Cerro Cárcel',
    address: 'Pérez 173, Cerro Cárcel',
    lat: -33.0453,
    lng: -71.6247,
    distanceToCenterKm: 1.2,
    rating: 8.6,
    reviewsCount: 806,
    pricePerNight: 89000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'bar', 'estacionamiento', 'calefaccion'],
    shortDescription: 'Casona reconvertida junto al Parque Cultural, con vista amplia.',
    description:
      'Una casona de 1907 reconvertida con criterio minimalista, a pasos del Parque Cultural de Valparaíso. Las habitaciones superiores tienen vista despejada de la bahía y hay estacionamiento propio, algo escaso en los cerros.',
    highlights: ['Junto al Parque Cultural', 'Estacionamiento propio', 'Vista despejada de la bahía'],
  },
  {
    name: 'Hostal Luna Sonrisa',
    type: 'Hostal',
    stars: 0,
    neighborhood: 'Cerro Alegre',
    address: 'Templeman 833, Cerro Alegre',
    lat: -33.0407,
    lng: -71.6299,
    distanceToCenterKm: 0.7,
    rating: 8.8,
    reviewsCount: 1521,
    pricePerNight: 38000,
    amenities: ['wifi', 'desayuno', 'cocina', 'terraza', 'lavanderia', 'calefaccion'],
    shortDescription: 'Hostal clásico del cerro, con biblioteca de viajes y patio.',
    description:
      'Uno de los hostales más queridos del cerro: biblioteca con mapas y libros sobre Chile, patio interior, cocina de uso común y habitaciones privadas además de los dormitorios compartidos.',
    highlights: ['Biblioteca de viajes', 'Cocina de uso común', 'Privadas y compartidas'],
    sustainable: true,
  },
  {
    name: 'Casa Aventura',
    type: 'Hostal',
    stars: 0,
    neighborhood: 'Cerro Concepción',
    address: 'Pasaje Gálvez 11, Cerro Concepción',
    lat: -33.0399,
    lng: -71.6259,
    distanceToCenterKm: 0.42,
    rating: 8.1,
    reviewsCount: 1187,
    pricePerNight: 29000,
    amenities: ['wifi', 'desayuno', 'cocina', 'lavanderia', 'terraza'],
    shortDescription: 'Casona de 1880 con dormitorios amplios y ambiente mochilero.',
    description:
      'Una casona de 1880 de techos altísimos en un pasaje peatonal. Ambiente mochilero, cocina grande y una sala común donde siempre hay alguien organizando una salida para el día siguiente.',
    highlights: ['Casona de 1880', 'Pasaje peatonal tranquilo', 'Ambiente mochilero'],
  },
  {
    name: 'Casa Kultur Valparaíso',
    type: 'Hostal',
    stars: 0,
    neighborhood: 'Cerro Alegre',
    address: 'Miramar 55, Cerro Alegre',
    lat: -33.0415,
    lng: -71.6294,
    distanceToCenterKm: 0.68,
    rating: 8.4,
    reviewsCount: 742,
    pricePerNight: 33000,
    amenities: ['wifi', 'desayuno', 'cocina', 'terraza', 'bar', 'lavanderia'],
    shortDescription: 'Hostal con terraza-bar y agenda cultural propia.',
    description:
      'Hostal con programación cultural propia: ciclos de cine en la terraza, tocatas pequeñas y talleres. Habitaciones privadas y compartidas, todas con acceso a la azotea que mira al puerto.',
    highlights: ['Agenda cultural propia', 'Azotea con vista al puerto', 'Privadas y compartidas'],
  },
  {
    name: 'The Yellow House',
    type: 'Bed & Breakfast',
    stars: 0,
    neighborhood: 'Cerro Artillería',
    address: 'Capitán Muñoz Gamero 91, Cerro Artillería',
    lat: -33.0334,
    lng: -71.6363,
    distanceToCenterKm: 1.4,
    rating: 9,
    reviewsCount: 1034,
    pricePerNight: 62000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'calefaccion'],
    shortDescription: 'B&B familiar con la mejor vista al puerto desde Artillería.',
    description:
      'Un bed & breakfast familiar en Cerro Artillería, con vista frontal a la entrada del puerto y a los buques de la Armada. El desayuno con vista es su sello y el paseo 21 de Mayo queda a tres cuadras.',
    highlights: ['Vista frontal al puerto', 'Desayuno con vista', 'Cerca del paseo 21 de Mayo'],
  },
  {
    name: 'Mirador Bellavista Apart',
    type: 'Apartamento',
    stars: 0,
    neighborhood: 'Cerro Bellavista',
    address: 'Héctor Calvo 392, Cerro Bellavista',
    lat: -33.0463,
    lng: -71.6288,
    distanceToCenterKm: 1.3,
    rating: 8.5,
    reviewsCount: 316,
    pricePerNight: 68000,
    discountPct: 10,
    amenities: ['wifi', 'cocina', 'vista-mar', 'terraza', 'lavanderia', 'calefaccion', 'mascotas'],
    shortDescription: 'Departamentos completos junto a La Sebastiana.',
    description:
      'Departamentos completos con cocina y terraza privada, a dos cuadras de La Sebastiana. Buena opción para familias o estadías de una semana: hay lavadora, escritorio e internet estable.',
    highlights: ['Departamento completo', 'Junto a La Sebastiana', 'Lavadora e internet estable'],
  },
  {
    name: 'Hotel Diego de Almagro Valparaíso',
    type: 'Hotel',
    stars: 4,
    neighborhood: 'El Almendral',
    address: 'Molina 76, El Almendral',
    lat: -33.0468,
    lng: -71.6157,
    distanceToCenterKm: 1.9,
    rating: 8,
    reviewsCount: 2314,
    pricePerNight: 82000,
    amenities: ['wifi', 'desayuno', 'piscina', 'gimnasio', 'estacionamiento', 'restaurante', 'aire', 'recepcion-24h', 'accesible'],
    shortDescription: 'Hotel de cadena con piscina, gimnasio y estacionamiento.',
    description:
      'Un hotel de cadena en El Almendral, práctico si viajas en auto o por trabajo: estacionamiento cubierto, piscina en el último piso, gimnasio y salas de reuniones. El metro queda a dos cuadras.',
    highlights: ['Estacionamiento cubierto', 'Piscina en el último piso', 'A dos cuadras del metro'],
  },
  {
    name: 'ibis Valparaíso',
    type: 'Hotel',
    stars: 3,
    neighborhood: 'El Plan',
    address: 'Errázuriz 891, El Plan',
    lat: -33.0409,
    lng: -71.6218,
    distanceToCenterKm: 0.9,
    rating: 7.8,
    reviewsCount: 1876,
    pricePerNight: 64000,
    amenities: ['wifi', 'desayuno', 'restaurante', 'bar', 'estacionamiento', 'aire', 'recepcion-24h', 'accesible'],
    shortDescription: 'Estándar de cadena frente al borde costero, con recepción 24 h.',
    description:
      'Sobre Errázuriz, mirando al borde costero. Habitaciones estandarizadas y sin sorpresas, recepción 24 horas y desayuno buffet temprano: sirve si llegas de noche o sales en el primer bus.',
    highlights: ['Frente al borde costero', 'Recepción 24 horas', 'Desayuno buffet temprano'],
  },
  {
    name: 'Hotel Puerto Natura',
    type: 'Hotel',
    stars: 3,
    neighborhood: 'Playa Ancha',
    address: 'Av. Gran Bretaña 2440, Playa Ancha',
    lat: -33.0311,
    lng: -71.6415,
    distanceToCenterKm: 2.4,
    rating: 8.3,
    reviewsCount: 288,
    pricePerNight: 71000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'estacionamiento', 'spa', 'calefaccion', 'mascotas'],
    shortDescription: 'Retiro tranquilo en Playa Ancha, con jardín y sauna.',
    description:
      'Sobre avenida Gran Bretaña, en la parte alta de Playa Ancha. Jardín grande, sauna y una calma que no se consigue en el casco histórico; conviene tener auto o presupuestar taxis para bajar de noche.',
    highlights: ['Jardín y sauna', 'Muy tranquilo', 'Vista al océano abierto'],
    sustainable: true,
  },
  {
    name: 'Hostal Barón Bahía',
    type: 'Hostal',
    stars: 0,
    neighborhood: 'Barón',
    address: 'Av. España 1450, Barón',
    lat: -33.0432,
    lng: -71.6081,
    distanceToCenterKm: 2.8,
    rating: 7.6,
    reviewsCount: 412,
    pricePerNight: 26000,
    amenities: ['wifi', 'cocina', 'lavanderia', 'vista-mar', 'terraza'],
    shortDescription: 'La opción más económica, frente al muelle Barón.',
    description:
      'Frente al muelle Barón y al ascensor del mismo nombre. Es la alternativa más económica del listado: básica, limpia y con una terraza que da de lleno a la bahía. Metro a una cuadra.',
    highlights: ['El precio más bajo del listado', 'Frente al muelle Barón', 'Metro a una cuadra'],
  },
  {
    name: 'Hotel Panteón Mirador',
    type: 'Bed & Breakfast',
    stars: 0,
    neighborhood: 'Cerro Panteón',
    address: 'Dinamarca 590, Cerro Panteón',
    lat: -33.0443,
    lng: -71.6301,
    distanceToCenterKm: 1.05,
    rating: 8.7,
    reviewsCount: 254,
    pricePerNight: 57000,
    amenities: ['wifi', 'desayuno', 'vista-mar', 'terraza', 'cocina', 'calefaccion'],
    shortDescription: 'Seis habitaciones sobre calle Dinamarca, con vista de casi 180°.',
    description:
      'Seis habitaciones en la parte alta de calle Dinamarca, con una vista de casi 180 grados sobre la bahía. Desayuno con fruta y pan de la panadería del barrio; la subida es empinada, pero la vista lo compensa.',
    highlights: ['Vista de casi 180°', 'Solo 6 habitaciones', 'Desayuno de barrio'],
  },
]

/* ------------------------------------------------------------------ *
 * Generadores deterministas: mismas entradas, mismos datos.           *
 * ------------------------------------------------------------------ */

/** Hash entero estable (FNV-1a) para derivar datos reproducibles por hotel. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function pick<T>(items: readonly T[], seed: number): T {
  // Los seeds nunca son negativos, asi que el indice siempre cae dentro del arreglo.
  return items[seed % items.length] as T
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const PROVIDERS = ['Reserva directa', 'Booking.com', 'Expedia', 'Despegar', 'Hoteles.com', 'Agoda']

function buildDeals(seed: HotelSeed, id: string): Deal[] {
  const base = hash(id)
  const count = 2 + (base % 3)
  const deals: Deal[] = []
  for (let i = 0; i < count; i += 1) {
    const drift = ((base >> (i * 3)) % 11) - 3
    deals.push({
      // Paso de 1 sobre la lista: con hasta 4 ofertas nunca se repite proveedor,
      // que es la clave con la que la UI identifica cada fila.
      provider: pick(PROVIDERS, base + i),
      pricePerNight: Math.round((seed.pricePerNight * (100 + drift * 1.6)) / 100 / 500) * 500,
      freeCancellation: (base >> i) % 3 !== 0,
      breakfastIncluded: seed.amenities.includes('desayuno') && i % 2 === 0,
      payAtProperty: (base >> (i + 2)) % 2 === 0,
    })
  }
  return deals.sort((a, b) => a.pricePerNight - b.pricePerNight)
}

interface RoomTemplate {
  name: string
  description: string
  capacity: number
  beds: string
  sizeM2: number
  factor: number
}

const ROOM_TEMPLATES: readonly RoomTemplate[] = [
  {
    name: 'Habitación estándar',
    description: 'Interior, sin vista. La opción más económica del alojamiento.',
    capacity: 2,
    beds: '1 cama matrimonial',
    sizeM2: 18,
    factor: 1,
  },
  {
    name: 'Doble twin',
    description: 'Dos camas separadas, ideal para viajes de trabajo o entre amistades.',
    capacity: 2,
    beds: '2 camas individuales',
    sizeM2: 22,
    factor: 1.1,
  },
  {
    name: 'Superior con vista',
    description: 'Ventanal orientado a la bahía y escritorio de trabajo.',
    capacity: 2,
    beds: '1 cama king',
    sizeM2: 24,
    factor: 1.28,
  },
  {
    name: 'Suite familiar',
    description: 'Dormitorio principal más sala con sofá cama y baño completo.',
    capacity: 4,
    beds: '1 cama king + 1 sofá cama',
    sizeM2: 38,
    factor: 1.72,
  },
]

const DORM_TEMPLATE: RoomTemplate = {
  name: 'Cama en dormitorio compartido',
  description: 'Cama con locker individual, lámpara y enchufe propio. Baño compartido.',
  capacity: 1,
  beds: '1 cama en dormitorio de 6',
  sizeM2: 4,
  factor: 0.62,
}

function buildRooms(seed: HotelSeed, id: string): RoomOption[] {
  const base = hash(`rooms-${id}`)
  const templates: readonly RoomTemplate[] =
    seed.type === 'Hostal' ? [DORM_TEMPLATE, ...ROOM_TEMPLATES.slice(0, 2)] : ROOM_TEMPLATES

  return templates.map((tpl, index) => ({
    id: `${id}-room-${index + 1}`,
    name: tpl.name,
    description: tpl.description,
    capacity: tpl.capacity,
    beds: tpl.beds,
    sizeM2: tpl.sizeM2,
    pricePerNight: Math.round((seed.pricePerNight * tpl.factor) / 500) * 500,
    refundable: (base >> index) % 4 !== 0,
    breakfastIncluded: seed.amenities.includes('desayuno') && index !== 0,
    available: 1 + ((base >> (index + 1)) % 5),
  }))
}

const REVIEW_AUTHORS: ReadonlyArray<{ author: string; country: string }> = [
  { author: 'Camila R.', country: 'Chile' },
  { author: 'Tomás V.', country: 'Chile' },
  { author: 'Marion L.', country: 'Francia' },
  { author: 'Diego S.', country: 'Argentina' },
  { author: 'Hannah B.', country: 'Alemania' },
  { author: 'Paula M.', country: 'España' },
  { author: 'Renato F.', country: 'Brasil' },
  { author: 'Elizabeth K.', country: 'Reino Unido' },
]

const REVIEW_BODIES: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'La vista lo justifica todo',
    body: 'Despertar con la bahía por la ventana es otra cosa. La subida cansa, pero se compensa apenas abres la cortina.',
  },
  {
    title: 'Ubicación perfecta para caminar',
    body: 'Salimos a pie a todos lados: ascensores, murales, restaurantes. No usamos auto en tres días.',
  },
  {
    title: 'Muy buena atención',
    body: 'El equipo nos armó una ruta a pie por los cerros y nos guardó las maletas después del check-out. Detalles que se notan.',
  },
  {
    title: 'Desayuno destacable',
    body: 'Pan amasado, fruta fresca y café de verdad. Empezar así el día en Valparaíso vale mucho.',
  },
  {
    title: 'Se escucha algo de ruido',
    body: 'La habitación es cómoda y limpia, pero los fines de semana hay movimiento en la calle hasta tarde. Pide una interior.',
  },
  {
    title: 'Volvería sin dudarlo',
    body: 'Relación precio-calidad muy buena para la zona. La casa está bien mantenida y la calefacción funciona.',
  },
]

function buildReviews(seed: HotelSeed, id: string): Review[] {
  const base = hash(`rev-${id}`)
  return Array.from({ length: 4 }, (_, i) => {
    const person = pick(REVIEW_AUTHORS, base + i * 7)
    const content = pick(REVIEW_BODIES, base + i * 5)
    const offsetDays = 12 + ((base >> i) % 300)
    const date = new Date(Date.UTC(2026, 7, 20) - offsetDays * 86_400_000)
    const delta = ((base >> (i + 3)) % 12) / 10 - 0.6
    return {
      id: `${id}-review-${i + 1}`,
      author: person.author,
      country: person.country,
      score: Math.min(10, Math.max(6, Math.round((seed.rating + delta) * 10) / 10)),
      date: date.toISOString().slice(0, 10),
      title: content.title,
      body: content.body,
    }
  })
}

function expand(seed: HotelSeed, index: number): Hotel {
  const id = `vpo-${String(index + 1).padStart(3, '0')}`
  const original =
    seed.discountPct === undefined
      ? null
      : Math.round(seed.pricePerNight / (1 - seed.discountPct / 100) / 1000) * 1000

  return {
    id,
    slug: slugify(seed.name),
    name: seed.name,
    type: seed.type,
    stars: seed.stars,
    neighborhood: seed.neighborhood,
    address: seed.address,
    coords: { lat: seed.lat, lng: seed.lng },
    distanceToCenterKm: seed.distanceToCenterKm,
    rating: seed.rating,
    reviewsCount: seed.reviewsCount,
    pricePerNight: seed.pricePerNight,
    originalPricePerNight: original,
    currency: 'CLP',
    amenities: seed.amenities,
    // Modo demo sin fotos reales: la UI dibuja una ilustración determinista por hotel.
    images: [],
    shortDescription: seed.shortDescription,
    description: seed.description,
    highlights: seed.highlights,
    deals: buildDeals(seed, id),
    rooms: buildRooms(seed, id),
    reviews: buildReviews(seed, id),
    checkIn: '15:00',
    checkOut: '12:00',
    sustainable: seed.sustainable ?? false,
    featured: seed.featured ?? false,
  }
}

export const HOTELS: Hotel[] = SEEDS.map(expand)

export const PRICE_BOUNDS = {
  min: Math.min(...HOTELS.map((h) => h.pricePerNight)),
  max: Math.max(...HOTELS.map((h) => h.pricePerNight)),
}

export function findHotelBySlug(slug: string): Hotel | undefined {
  return HOTELS.find((h) => h.slug === slug)
}

/** Lista de destinos sugeridos en el autocompletado del buscador. */
export const DESTINATIONS: string[] = [
  'Valparaíso, Chile',
  'Cerro Alegre, Valparaíso',
  'Cerro Concepción, Valparaíso',
  'Cerro Bellavista, Valparaíso',
  'Playa Ancha, Valparaíso',
  'El Plan, Valparaíso',
  'Viña del Mar, Chile',
]
