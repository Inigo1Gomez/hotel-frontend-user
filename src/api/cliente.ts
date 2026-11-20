import { BOOKINGS_URL } from './bookings'

export interface ResultadoRuta {
  ruta: string
  status: number
  /** Código de error del backend o del API Gateway, si vino uno. */
  detalle?: string
}

/**
 * Llama a una ruta de hotel-ms-reservas con el access token de Cognito y devuelve solo el status.
 * Lo usa "Mi cuenta" para mostrar que el token abre las rutas de cliente y no las de Admin u Operador.
 */
export async function probarRuta(ruta: string, accessToken: string): Promise<ResultadoRuta> {
  try {
    const respuesta = await fetch(`${BOOKINGS_URL.replace(/\/$/, '')}${ruta}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: unknown; message?: unknown }
    const detalle = typeof cuerpo.error === 'string' ? cuerpo.error : typeof cuerpo.message === 'string' ? cuerpo.message : undefined
    return { ruta, status: respuesta.status, ...(detalle ? { detalle } : {}) }
  } catch {
    return { ruta, status: 0, detalle: 'Sin respuesta del backend' }
  }
}
