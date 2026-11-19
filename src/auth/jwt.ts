/** Claims de los tokens de Cognito que usa la app. */
export interface ClaimsCognito {
  sub?: string
  email?: string
  name?: string
  exp?: number
  iss?: string
  token_use?: string
  client_id?: string
  aud?: string
  'cognito:groups'?: string[]
  [claim: string]: unknown
}

/**
 * Lee el payload de un JWT sin validarlo: solo sirve para mostrar datos en pantalla.
 * La validación real (firma, issuer, client_id, grupo) la hacen el API Gateway y hotel-ms-reservas.
 */
export function leerClaims(token: string): ClaimsCognito {
  const payload = token.split('.')[1]
  if (!payload) return {}
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as ClaimsCognito
  } catch {
    return {}
  }
}
