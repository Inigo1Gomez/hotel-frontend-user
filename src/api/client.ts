/**
 * Cliente HTTP minimo del frontend de usuario. Cada API tiene su URL base:
 * catalogo (`api/catalogo.ts`) y reservas (`api/bookings.ts`).
 */

export class ApiError extends Error {
  readonly status: number
  /** Codigo de error del backend, p. ej. RESERVA_NO_ENCONTRADA. */
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    if (code) this.code = code
  }
}

interface RequestOptions {
  signal?: AbortSignal
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  baseUrl: string
  /** Access token de Cognito para las rutas /cliente. */
  token?: string
}

export async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const { signal, method = 'GET', body, baseUrl, token } = options
  const url = `${baseUrl.replace(/\/$/, '')}${path}`

  const response = await fetch(url, {
    method,
    signal: signal ?? null,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { error?: unknown }
    throw new ApiError(
      `La solicitud a ${path} falló (${response.status})`,
      response.status,
      typeof error.error === 'string' ? error.error : undefined,
    )
  }

  return (await response.json()) as T
}

/** Latencia simulada en modo demo para que los estados de carga sean visibles. */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}
