import type { Neighborhood } from '@/types/hotel'

export interface NeighborhoodInfo {
  name: Neighborhood
  tagline: string
  description: string
  /** Acento del sistema con el que se pinta la tarjeta del barrio. */
  tone: 'red' | 'blue' | 'yellow' | 'green' | 'teal'
}

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  {
    name: 'Cerro Alegre',
    tagline: 'Murales, cafés y miradores',
    description:
      'El corazón del casco histórico Patrimonio de la Humanidad. Calles empedradas, galerías y la mayor concentración de hoteles boutique de la ciudad.',
    tone: 'red',
  },
  {
    name: 'Cerro Concepción',
    tagline: 'Paseos ingleses y ascensores',
    description:
      'Vecino de Cerro Alegre, con el Paseo Gervasoni, el Paseo Atkinson y el ascensor El Peral. Ideal si quieres caminar a todo.',
    tone: 'blue',
  },
  {
    name: 'Cerro Bellavista',
    tagline: 'Museo a Cielo Abierto',
    description:
      'Arte urbano, La Sebastiana de Neruda y precios más amables que en los cerros vecinos.',
    tone: 'yellow',
  },
  {
    name: 'Cerro Cárcel',
    tagline: 'Cultura y parque',
    description: 'El Parque Cultural de Valparaíso y una vida de barrio tranquila a diez minutos del plan.',
    tone: 'green',
  },
  {
    name: 'Cerro Panteón',
    tagline: 'Vistas amplias, calma total',
    description: 'Miradores sobre la bahía y alojamientos independientes, lejos del ruido nocturno.',
    tone: 'teal',
  },
  {
    name: 'Cerro Artillería',
    tagline: 'Atardeceres sobre la bahía',
    description: 'El paseo 21 de Mayo, el Museo Naval y las mejores puestas de sol del puerto.',
    tone: 'red',
  },
  {
    name: 'Playa Ancha',
    tagline: 'Residencial y universitario',
    description: 'Barrio amplio junto al estadio y la costa oeste. Buenos apartamentos por menos plata.',
    tone: 'blue',
  },
  {
    name: 'El Plan',
    tagline: 'Todo a pie desde el puerto',
    description: 'La zona baja junto a Plaza Sotomayor y el Muelle Prat. Conexión directa con buses y metro.',
    tone: 'green',
  },
  {
    name: 'El Almendral',
    tagline: 'Cadenas y buena conexión',
    description: 'Avenida Argentina, la feria y las estaciones de metro. Hoteles de cadena con estacionamiento.',
    tone: 'yellow',
  },
  {
    name: 'Barón',
    tagline: 'Frente al muelle',
    description: 'Junto al ascensor Barón y el borde costero, con vistas frontales a la bahía.',
    tone: 'teal',
  },
]

const BY_NAME = new Map(NEIGHBORHOODS.map((n) => [n.name, n]))

export function getNeighborhood(name: Neighborhood): NeighborhoodInfo | undefined {
  return BY_NAME.get(name)
}
