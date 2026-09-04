/**
 * Cliente HTTP minimo del frontend de usuario.
 *
 * `VITE_API_URL` apunta al microservicio de reservas. Si esta vacio, la app
 * funciona en modo demo contra el dataset local (`src/data/hotels.ts`).
 */

export const API_URL: string = (import.meta.env.VITE_API_URL ?? '').trim()

export const IS_DEMO_MODE = API_URL === ''

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  signal?: AbortSignal
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { signal, method = 'GET', body } = options
  const url = `${API_URL.replace(/\/$/, '')}${path}`

  const response = await fetch(url, {
    method,
    signal: signal ?? null,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw new ApiError(`La solicitud a ${path} falló (${response.status})`, response.status)
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
