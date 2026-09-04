import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { IS_DEMO_MODE } from '@/api/client'

const FAQ = [
  {
    q: '¿Cómo reservo un alojamiento?',
    a: 'Busca por fechas, abre la ficha del alojamiento, elige una habitación y completa tus datos. Recibirás la confirmación por correo.',
  },
  {
    q: '¿Los precios incluyen impuestos?',
    a: 'El precio por noche que se muestra es el precio final para residentes en Chile. Las personas extranjeras sin residencia pueden quedar exentas de IVA pagando en dólares; el alojamiento lo indica al llegar.',
  },
  {
    q: '¿Puedo cancelar sin costo?',
    a: 'Depende de la tarifa. Las habitaciones marcadas como «Cancelación gratis» admiten cancelación hasta 48 horas antes del check-in; las no reembolsables, no.',
  },
  {
    q: '¿Conviene alojarse en el plan o en los cerros?',
    a: 'Los cerros Alegre y Concepción concentran la oferta patrimonial y todo queda a distancia caminable. El plan y El Almendral son más prácticos si llegas en auto o viajas por trabajo.',
  },
  {
    q: '¿Cómo llego desde el aeropuerto de Santiago?',
    a: 'Hay buses directos desde el aeropuerto y desde el Terminal Alameda, con unas dos horas de viaje. Algunos alojamientos ofrecen traslado; búscalos con el filtro «Traslado aeropuerto».',
  },
]

export function HelpPage() {
  return (
    <section className="section">
      <div className="container section-inner help-page">
        <div className="section-heading">
          <span className="eyebrow">Ayuda</span>
          <h1 className="section-title">
            Todo lo que necesitas para <span className="hl-red">reservar tranquilo</span>
          </h1>
        </div>

        {IS_DEMO_MODE && (
          <p className="demo-note">
            <Icon name="sparkles" size={16} />
            <span>
              <strong>Modo demo.</strong> Este frontend todavía no está conectado al microservicio de
              reservas, así que ninguna solicitud se envía a un servidor.
            </span>
          </p>
        )}

        <div className="faq-list" id="faq">
          {FAQ.map((item, index) => (
            <Reveal key={item.q} as="fade-up" delay={index * 0.04}>
              <details className="faq-item">
                <summary>
                  {item.q}
                  <Icon name="chevron-down" size={18} />
                </summary>
                <p>{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="card help-contact" id="contacto">
          <span className="card-icon is-blue">
            <Icon name="pin" size={22} />
          </span>
          <h2>¿Necesitas ayuda con una reserva?</h2>
          <p>Escríbenos y te respondemos el mismo día hábil.</p>
          <a href="mailto:hola@portalvalparaiso.cl" className="btn btn-primary">
            hola@portalvalparaiso.cl
          </a>
          <Link to="/hoteles" className="arrow-link help-contact-link">
            Volver a los alojamientos
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
