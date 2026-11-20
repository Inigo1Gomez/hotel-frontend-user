import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // El config no ve el .env en process.env: loadEnv lo lee (sin filtrar por prefijo).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // En Windows, Vite se ata solo a ::1 y entonces 127.0.0.1 rechaza la conexion.
      // `host: true` escucha en IPv4 e IPv6, y ademas expone la URL de red local.
      host: true,
      port: 5173,
      // Los microservicios viven aparte: se proxean en desarrollo (no tienen CORS).
      proxy: {
        // hotel-ms-reservas (local o EC2): /api/reservas/api/v1/... -> <destino>/api/v1/...
        '/api/reservas': {
          target: env.VITE_RESERVAS_PROXY || 'http://localhost:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/reservas/, ''),
        },
        // hotel-ms-catalogo (local o EC2): /api/catalogo/api/v1/... -> <destino>/api/v1/...
        '/api/catalogo': {
          target: env.VITE_CATALOGO_PROXY || 'http://localhost:8088',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/catalogo/, ''),
        },
      },
    },
    preview: {
      host: true,
      port: 4173,
    },
  }
})
