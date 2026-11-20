/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** hotel-ms-catalogo (lectura pública). Vacío = dataset local (modo demo). */
  readonly VITE_CATALOGO_URL?: string
  readonly VITE_RESERVAS_URL?: string
  /** Región del User Pool de Cognito (por defecto us-east-1). */
  readonly VITE_COGNITO_REGION?: string
  /** App client público (sin secreto) del User Pool. Vacío = sin cuentas de huésped. */
  readonly VITE_COGNITO_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
