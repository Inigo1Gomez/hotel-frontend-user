import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Hotel, SearchCriteria } from '@/types/hotel'
import { Icon } from '@/components/ui/Icon'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { HotelImage } from '@/components/ui/HotelImage'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { StarRating } from '@/components/ui/StarRating'
import { SearchBar } from '@/components/search/SearchBar'
import { NEIGHBORHOODS } from '@/data/neighborhoods'
import { getFeaturedHotels } from '@/api/hotels'
import { IS_DEMO_MODE } from '@/api/client'
import { buildSearchUrl, defaultSearchQuery } from '@/lib/searchParams'
import { formatNumber, formatPrice } from '@/lib/format'
import { HOTELS } from '@/data/hotels'

const STATS = [
  { value: '24', label: 'alojamientos publicados' },
  { value: '10', label: 'cerros y barrios' },
  { value: '4,2 k', label: 'opiniones verificadas' },
  { value: '0 %', label: 'comisión al viajero' },
]

const REASONS = [
  {
    icon: 'sparkles' as const,
    tone: '',
    title: 'Solo Valparaíso',
    body: 'No competimos con los grandes buscadores en volumen: cubrimos una ciudad y la cubrimos bien, cerro por cerro.',
  },
  {
    icon: 'shield' as const,
    tone: 'is-blue',
    title: 'Precio final, sin sorpresas',
    body: 'Lo que ves por noche es lo que pagas. Los cargos y el aseo, si existen, aparecen antes de confirmar.',
  },
  {
    icon: 'leaf' as const,
    tone: 'is-green',
    title: 'Anfitriones del barrio',
    body: 'Priorizamos casas patrimoniales y negocios locales por sobre las cadenas. El dinero se queda en el puerto.',
  },
]

const EXPERIENCES = [
  {
    id: 'patrimonio',
    label: 'Patrimonio',
    title: 'El casco histórico, a pie',
    body: 'Los quince ascensores que aún funcionan, los paseos Gervasoni y Atkinson, y la arquitectura inglesa y alemana del siglo XIX.',
    items: ['Ascensor El Peral', 'Paseo Yugoslavo', 'Iglesia Luterana', 'Muelle Prat'],
  },
  {
    id: 'arte',
    label: 'Arte urbano',
    title: 'Museo a Cielo Abierto',
    body: 'Cerro Bellavista concentra los murales que hicieron famosa a la ciudad, con obras que se renuevan cada temporada.',
    items: ['Museo a Cielo Abierto', 'Escalera Piano', 'La Sebastiana', 'Calle Ferrari'],
  },
  {
    id: 'gastronomia',
    label: 'Gastronomía',
    title: 'Del muelle a la mesa',
    body: 'Caletas, picadas y cocina de autor conviven en pocas cuadras. La pesca del día llega al plato la misma mañana.',
    items: ['Caleta Portales', 'Mercado El Cardonal', 'Cocina porteña', 'Bares de Almirante Montt'],
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Reservamos en Cerro Concepción y no tocamos el auto en cuatro días. El filtro por cerro es exactamente lo que faltaba.',
    author: 'Camila R.',
    origin: 'Santiago',
  },
  {
    quote:
      'Comparé el mismo hotel en tres sitios y aquí el precio por noche era el precio final. Sin cargos escondidos al pagar.',
    author: 'Marion L.',
    origin: 'Lyon, Francia',
  },
  {
    quote:
      'Buscaba algo con vista al mar y que aceptara perro. Dos filtros y listo; en otros buscadores me tomó media hora.',
    author: 'Diego S.',
    origin: 'Mendoza, Argentina',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const [criteria, setCriteria] = useState<SearchCriteria>(() => {
    const { destination, checkIn, checkOut, guests } = defaultSearchQuery()
    return { destination, checkIn, checkOut, guests }
  })
  const [featured, setFeatured] = useState<Hotel[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [activeExperience, setActiveExperience] = useState(EXPERIENCES[0]!.id)

  useEffect(() => {
    const controller = new AbortController()
    getFeaturedHotels(6, controller.signal)
      .then((hotels) => {
        setFeatured(hotels)
        setLoadingFeatured(false)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        // En modo demo esto no debería ocurrir; con API real dejamos la sección vacía.
        setFeatured([])
        setLoadingFeatured(false)
      })
    return () => controller.abort()
  }, [])

  const submit = (next: SearchCriteria) => {
    setCriteria(next)
    navigate(buildSearchUrl({ ...defaultSearchQuery(), ...next }))
  }

  const cheapest = Math.min(...HOTELS.map((h) => h.pricePerNight))
  const experience = EXPERIENCES.find((e) => e.id === activeExperience) ?? EXPERIENCES[0]!

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-blob is-red" />
          <span className="hero-blob is-blue" />
          <span className="hero-blob is-yellow" />
        </div>

        <div className="container hero-inner">
          <Reveal as="scale" immediate>
            <span className="badge is-soft hero-badge">
              <Icon name="pin" size={13} />
              Valparaíso, Chile
            </span>
          </Reveal>

          <Reveal as="fade-up" delay={0.05} immediate>
            <h1 className="hero-title">
              Dormir en los <span className="hl-red">cerros</span>,
              <br />
              despertar frente a la <span className="hl-blue">bahía</span>
            </h1>
          </Reveal>

          <Reveal as="fade-up" delay={0.12} immediate>
            <p className="hero-lede">
              Hoteles boutique, hostales y casas patrimoniales de Valparaíso, comparados en un solo
              lugar. Desde {formatPrice(cheapest)} la noche.
            </p>
          </Reveal>

          <Reveal as="fade-up" delay={0.2} className="hero-search" immediate>
            <SearchBar value={criteria} onSubmit={submit} submitLabel="Buscar" />
          </Reveal>

          <Reveal as="fade" delay={0.3} immediate>
            <ul className="hero-stats">
              {STATS.map((stat) => (
                <li key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <a href="#destacados" className="hero-scroll-cue" aria-label="Ir a los destacados">
          <Icon name="chevron-down" size={18} />
        </a>
      </section>

      <section className="section" id="destacados">
        <div className="container section-inner">
          <div className="section-heading">
            <span className="eyebrow">Destacados</span>
            <h2 className="section-title">
              Los alojamientos que <span className="hl-red">más recomiendan</span> quienes ya fueron
            </h2>
            <p className="section-lede">
              Selección por puntaje, ubicación y opiniones recientes. Todos a distancia caminable de los
              paseos del casco histórico.
            </p>
          </div>

          {IS_DEMO_MODE && (
            <p className="demo-note featured-note">
              <Icon name="sparkles" size={16} />
              <span>
                <strong>Modo demo.</strong> Los alojamientos son reales, pero precios, puntajes y
                disponibilidad son ficticios hasta conectar el microservicio de reservas.
              </span>
            </p>
          )}

          {loadingFeatured ? (
            <div className="featured-grid" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="featured-card is-skeleton" aria-hidden="true">
                  <div className="featured-card-media skeleton-block" />
                  <div className="featured-card-body">
                    <div className="skeleton-line is-lg" />
                    <div className="skeleton-line is-sm" />
                    <div className="skeleton-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <Stagger className="featured-grid" stagger={0.06} immediate>
            {featured.map((hotel) => (
              <StaggerItem key={hotel.id}>
                <Link to={`/hotel/${hotel.slug}`} className="featured-card">
                  <div className="featured-card-media">
                    <HotelImage seed={hotel.id} src={hotel.images[0]} alt={`Ilustración de ${hotel.name}`} />
                    <span className="featured-card-price">{formatPrice(hotel.pricePerNight)}/noche</span>
                  </div>
                  <div className="featured-card-body">
                    <div className="featured-card-titleline">
                      <h3>{hotel.name}</h3>
                      <StarRating stars={hotel.stars} />
                    </div>
                    <p className="featured-card-place">
                      <Icon name="pin" size={13} />
                      {hotel.neighborhood}
                    </p>
                    <p className="featured-card-desc">{hotel.shortDescription}</p>
                    <RatingBadge score={hotel.rating} reviews={hotel.reviewsCount} />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          )}

          <Reveal as="fade-up" className="section-cta">
            <Link to="/hoteles" className="btn btn-outline">
              Ver los 24 alojamientos
              <Icon name="arrow-right" size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-alt" id="barrios">
        <div className="container section-inner">
          <div className="section-heading is-center">
            <span className="eyebrow is-blue">Barrios</span>
            <h2 className="section-title">
              Cada cerro es una <span className="hl-blue">ciudad distinta</span>
            </h2>
            <p className="section-lede">
              Elegir bien el cerro importa más que elegir bien el hotel. Esto es lo que ofrece cada uno.
            </p>
          </div>

          <Stagger className="hood-grid" stagger={0.05}>
            {NEIGHBORHOODS.map((hood) => (
              <StaggerItem key={hood.name}>
                <Link
                  to={`/hoteles?barrio=${encodeURIComponent(hood.name)}`}
                  className={`hood-card tone-${hood.tone}`}
                >
                  <span className="hood-card-count">
                    {HOTELS.filter((h) => h.neighborhood === hood.name).length}
                  </span>
                  <h3>{hood.name}</h3>
                  <p className="hood-card-tagline">{hood.tagline}</p>
                  <p className="hood-card-desc">{hood.description}</p>
                  <span className="arrow-link">
                    Ver alojamientos
                    <Icon name="arrow-right" size={15} />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section" id="experiencias">
        <div className="container section-inner">
          <div className="section-heading">
            <span className="eyebrow">Experiencias</span>
            <h2 className="section-title">
              Qué hacer cuando <span className="hl-red">bajas del hotel</span>
            </h2>
          </div>

          <div className="exp-tabs" role="tablist" aria-label="Tipos de experiencia">
            {EXPERIENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={activeExperience === item.id}
                aria-controls={`panel-${item.id}`}
                className={`exp-tab ${activeExperience === item.id ? 'is-active' : ''}`}
                onClick={() => setActiveExperience(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            className="exp-panel"
            role="tabpanel"
            id={`panel-${experience.id}`}
            aria-labelledby={`tab-${experience.id}`}
          >
            <div className="exp-panel-body">
              <h3>{experience.title}</h3>
              <p>{experience.body}</p>
              <ul className="exp-list">
                {experience.items.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={15} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="exp-panel-media">
              <HotelImage seed={experience.id} alt="" variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="porque">
        <div className="container section-inner">
          <div className="section-heading is-center">
            <span className="eyebrow is-blue">Por qué aquí</span>
            <h2 className="section-title">
              Un buscador hecho para <span className="hl-blue">una sola ciudad</span>
            </h2>
          </div>

          <Stagger className="grid-3 reason-grid" stagger={0.08}>
            {REASONS.map((reason) => (
              <StaggerItem key={reason.title}>
                <article className="card is-interactive">
                  <span className={`card-icon ${reason.tone}`}>
                    <Icon name={reason.icon} size={22} />
                  </span>
                  <h3>{reason.title}</h3>
                  <p>{reason.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section" id="opiniones">
        <div className="container section-inner">
          <div className="section-heading">
            <span className="eyebrow">Opiniones</span>
            <h2 className="section-title">
              {formatNumber(HOTELS.reduce((sum, h) => sum + h.reviewsCount, 0))} opiniones detrás de cada
              puntaje
            </h2>
          </div>

          <Stagger className="grid-3 quote-grid" stagger={0.07}>
            {TESTIMONIALS.map((item) => (
              <StaggerItem key={item.author}>
                <figure className="quote-card">
                  <blockquote>{item.quote}</blockquote>
                  <figcaption>
                    <strong>{item.author}</strong>
                    <span>{item.origin}</span>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section cta">
        <div className="container section-inner cta-inner">
          <Reveal as="scale">
            <span className="cta-mark" aria-hidden="true">
              <Icon name="pin" size={30} />
            </span>
          </Reveal>
          <Reveal as="fade-up" delay={0.06}>
            <span className="eyebrow cta-eyebrow">Tu próximo viaje</span>
          </Reveal>
          <Reveal as="fade-up" delay={0.1}>
            <h2 className="cta-title">Elige tu cerro y reserva</h2>
          </Reveal>
          <Reveal as="fade-up" delay={0.16}>
            <p className="cta-lede">
              Filtra por precio, vista al mar o distancia caminando al Muelle Prat. En dos clics tienes
              la lista corta.
            </p>
          </Reveal>
          <Reveal as="fade-up" delay={0.22}>
            <div className="cta-actions">
              <Link to="/hoteles" className="btn btn-primary">
                Buscar alojamiento
              </Link>
              <a href="#top" className="btn btn-ghost">
                Volver arriba
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
