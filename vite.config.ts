import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
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
    // El microservicio de admin/API vive aparte: se proxea /api en desarrollo.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
})
