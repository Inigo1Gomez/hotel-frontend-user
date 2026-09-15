# Portal Valparaíso — frontend de usuario

Buscador y ficha de alojamientos de Valparaíso. Es solo el **frontend público**:
la administración vive en otro microservicio y no se toca desde aquí.

- **Arquitectura y sistema de diseño** tomados de [estudio204.cl](https://www.estudio204.cl):
  Vite + React + TypeScript + framer-motion, paleta crema con acentos rojo/azul/amarillo,
  Nunito, tarjetas de borde grueso con sombra dura y secciones ancladas con scroll-spy.
- **Interacción de búsqueda** al estilo de un metabuscador de hoteles: barra de destino/fechas/huéspedes,
  panel de filtros, orden, mapa lateral, paginación y comparación de ofertas por proveedor.

## Requisitos

- Node.js 20.19+ o 22.12+ (probado con 24.11)
- npm 10+

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre **http://localhost:5173** (también sirve `http://127.0.0.1:5173`).

> En Windows, Vite se ata por defecto solo a IPv6 (`[::1]`) y entonces `127.0.0.1`
> rechaza la conexión. Por eso `vite.config.ts` lleva `host: true`, que escucha en
> ambas pilas. Como efecto secundario, el servidor queda visible en la red local:
> útil para probar desde el teléfono, pero tenlo presente en redes compartidas.

Otros comandos:

```bash
npm run build      # typecheck + bundle de producción en dist/
npm run preview    # sirve dist/ localmente
npm run typecheck  # solo TypeScript
```

## Funciona sin conexión

No hay ninguna petición a internet: Nunito está autoalojada en `public/fonts`
(fuente variable, 4 archivos ≈ 108 KB) y las imágenes de los alojamientos son
ilustraciones SVG generadas en el cliente. Puedes desarrollar sin red.

**Refrescar (F5) funciona en cualquier ruta** con `npm run dev` y `npm run preview`,
porque ambos servidores devuelven `index.html` para rutas desconocidas. Si algún día
sirves `dist/` con otra cosa, hay que configurar ese *fallback* a mano o el F5 en
`/hoteles` dará 404:

```bash
# opción rápida para probar el build con cualquier servidor estático
npx serve -s dist        # el -s es el que activa el fallback a index.html
```

```nginx
# nginx
location / { try_files $uri $uri/ /index.html; }
```

```apache
# Apache: .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule . /index.html [L]
```

## GitHub Pages

Cada push a `main` ejecuta [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
y publica en **https://inigo1gomez.github.io/hotel-frontend-user/**. El build se hace con
`--base "/hotel-frontend-user/"` (el router toma ese prefijo de `import.meta.env.BASE_URL`) y se copia
`index.html` a `404.html` para que el F5 en rutas internas funcione.

En el repo, **Settings → Pages → Source** debe estar en `GitHub Actions`. Para apuntar a un backend,
define la variable `VITE_API_URL` en **Settings → Secrets and variables → Actions → Variables**.

## Modo demo y conexión al backend

Sin configuración, la app arranca en **modo demo**: los datos salen de
[`src/data/hotels.ts`](src/data/hotels.ts). Los 24 alojamientos son establecimientos
reales de Valparaíso, pero **precios, puntajes, disponibilidad y reseñas son ficticios**.
La interfaz lo advierte en pantalla mientras esté en este modo.

Para consumir el microservicio de reservas, copia `.env.example` a `.env` y define:

```
VITE_API_URL=https://tu-microservicio/api
```

Con esa variable, [`src/api/hotels.ts`](src/api/hotels.ts) deja de usar el dataset local
y llama a estos endpoints:

| Método | Ruta | Devuelve |
| --- | --- | --- |
| `GET` | `/hotels?<filtros>` | `SearchResult` (`hotels`, `total`, `page`, `pageSize`, `priceBounds`) |
| `GET` | `/hotels/:slug` | `Hotel` |
| `GET` | `/hotels/destacados?limite=6` | `Hotel[]` |

Los tipos de esos contratos están en [`src/types/hotel.ts`](src/types/hotel.ts) y los
nombres de los parámetros de consulta en `toQueryString` de `src/api/hotels.ts`
(`destino`, `checkIn`, `checkOut`, `adultos`, `ninos`, `habitaciones`, `orden`,
`pagina`, `tamano`, `precioMin`, `precioMax`, `puntajeMin`, `estrellas`, `barrio`,
`tipo`, `servicio`, `cancelacionGratis`, `desayuno`, `q`).

En desarrollo, `vite.config.ts` también proxea `/api` a `VITE_API_PROXY`
(por defecto `http://localhost:8080`) por si prefieres rutas relativas.

El envío de la reserva todavía **no** está conectado: el formulario del modal valida
y muestra la confirmación en cliente. El punto de integración está marcado en
[`src/components/detail/BookingPanel.tsx`](src/components/detail/BookingPanel.tsx).

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Portada: hero con buscador, destacados, barrios, experiencias, opiniones |
| `/hoteles` | Resultados con filtros, orden, mapa y paginación |
| `/hotel/:slug` | Ficha: galería, servicios, habitaciones, ofertas, opiniones y reserva |
| `/ayuda` | Preguntas frecuentes y contacto |

## Estructura

```
src/
├── api/            cliente HTTP y servicios (caen al dataset local en modo demo)
├── components/
│   ├── detail/     modal de reserva
│   ├── layout/     barra, pie, progreso de scroll
│   ├── results/    tarjeta, filtros, orden, mapa, paginación
│   ├── search/     barra de búsqueda y selector de huéspedes
│   └── ui/         iconos, ilustración generada, puntaje, animaciones
├── data/           alojamientos, barrios y servicios
├── hooks/          scroll-spy, media query, bloqueo de scroll, debounce
├── lib/            formato (es-CL/CLP), filtros y orden, (de)serialización de la URL
├── pages/          una por ruta
├── styles/         tokens, tipografía autoalojada y hojas por área
└── types/          modelo de dominio
```

## Decisiones que conviene conocer

- **El estado de búsqueda vive en la URL.** `src/lib/searchParams.ts` la serializa y la
  reconstruye validando cada valor, así que los enlaces se pueden compartir, el botón
  atrás funciona y un parámetro inválido cae al valor por defecto en vez de romper la vista.
- **Cero dependencias de red.** Tipografía autoalojada y sin fotos ni mapas externos:
  en modo demo cada alojamiento recibe una ilustración
  SVG determinista de fachadas porteñas (`HotelImage`) y el mapa es un esquema propio de
  la bahía, así que no hace falta clave de API. Si el backend entrega `images`, se usan
  esas fotos. Las burbujas de precio se reacomodan para no pisarse, porque los cerros del
  casco histórico caben en pocas cuadras.
- **Las fechas se manejan como `YYYY-MM-DD` en UTC** y se formatean con `timeZone: 'UTC'`,
  para que en Chile (UTC-3/-4) no se corran un día.
- **La tarjeta de resultado usa container queries**, no media queries: al abrir el mapa su
  columna se estrecha aunque la ventana siga siendo ancha.
- **Animaciones con respeto por `prefers-reduced-motion`**: `Reveal`/`Stagger` devuelven un
  `div` plano cuando el sistema pide menos movimiento. El contenido visible sin hacer scroll
  y el que llega por API usan `immediate`, porque el observador de viewport no se dispara
  para hijos que se montan después.

## Pendiente

- Conectar el `POST` de reserva al microservicio.
- Autenticación de usuario y "mis reservas".
- Reemplazar el mapa esquemático por uno real (Leaflet o MapLibre) si se necesita zoom.
