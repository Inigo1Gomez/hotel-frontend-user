/**
 * Llamadas al User Pool de AWS Cognito, directo a su API pública (sin SDK).
 *
 * El app client del frontend es público (sin secreto) y tiene habilitados los flujos
 * USER_PASSWORD_AUTH y REFRESH_TOKEN_AUTH. Estas operaciones no llevan credenciales de AWS:
 * Cognito las acepta desde el navegador con solo el ClientId.
 */

export const COGNITO_REGION: string = (import.meta.env.VITE_COGNITO_REGION ?? '').trim() || 'us-east-1'
export const COGNITO_CLIENT_ID: string = (import.meta.env.VITE_COGNITO_CLIENT_ID ?? '').trim()
export const COGNITO_ENABLED = COGNITO_CLIENT_ID !== ''

const ENDPOINT = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`

export class CognitoError extends Error {
  /** Nombre de la excepción de Cognito, p. ej. NotAuthorizedException. */
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CognitoError'
    this.code = code
  }
}

/** Mensajes en español para las excepciones que puede ver un huésped. */
const MENSAJES: Record<string, string> = {
  UsernameExistsException: 'Ya existe una cuenta con ese email. Inicia sesión o recupera tu contraseña.',
  InvalidPasswordException: 'La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula, número y símbolo.',
  CodeMismatchException: 'El código no es correcto. Revisa el correo e inténtalo de nuevo.',
  ExpiredCodeException: 'El código venció. Pide uno nuevo.',
  NotAuthorizedException: 'Email o contraseña incorrectos.',
  UserNotConfirmedException: 'Tu cuenta todavía no está confirmada. Ingresa el código que te enviamos por correo.',
  UserNotFoundException: 'Email o contraseña incorrectos.',
  LimitExceededException: 'Hiciste demasiados intentos. Espera unos minutos.',
  TooManyRequestsException: 'Hiciste demasiados intentos. Espera unos minutos.',
  TooManyFailedAttemptsException: 'Hiciste demasiados intentos. Espera unos minutos.',
  InvalidParameterException: 'Revisa los datos ingresados.',
  CodeDeliveryFailureException: 'No pudimos enviar el código por correo. Inténtalo más tarde.',
}

export function mensajeError(error: unknown): string {
  if (error instanceof CognitoError) return MENSAJES[error.code] ?? error.message
  if (error instanceof TypeError) return 'No pudimos conectar con el servicio de cuentas. Revisa tu conexión.'
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

async function llamar<T>(accion: string, cuerpo: Record<string, unknown>): Promise<T> {
  if (!COGNITO_ENABLED) {
    throw new CognitoError('NoConfigurado', 'Las cuentas de huésped no están configuradas (falta VITE_COGNITO_CLIENT_ID).')
  }
  const respuesta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${accion}`,
    },
    body: JSON.stringify({ ClientId: COGNITO_CLIENT_ID, ...cuerpo }),
  })
  const datos = (await respuesta.json().catch(() => ({}))) as Record<string, unknown>
  if (!respuesta.ok) {
    // __type viene como "NotAuthorizedException" o "com.amazonaws...#NotAuthorizedException".
    const tipo = String(datos.__type ?? 'Error').split('#').pop() ?? 'Error'
    throw new CognitoError(tipo, String(datos.message ?? datos.Message ?? `Cognito respondió ${respuesta.status}`))
  }
  return datos as T
}

export interface Tokens {
  accessToken: string
  idToken: string
  refreshToken: string
  /** Epoch en milisegundos en que vence el access token. */
  expiraEn: number
}

interface AuthenticationResult {
  AuthenticationResult?: { AccessToken: string; IdToken: string; RefreshToken?: string; ExpiresIn: number }
  ChallengeName?: string
}

function aTokens(resultado: AuthenticationResult, refreshAnterior?: string): Tokens {
  const auth = resultado.AuthenticationResult
  if (!auth) {
    throw new CognitoError(resultado.ChallengeName ?? 'SinTokens', 'La cuenta requiere un paso adicional que esta app no soporta.')
  }
  return {
    accessToken: auth.AccessToken,
    idToken: auth.IdToken,
    // Al refrescar, Cognito no devuelve un refresh token nuevo: se mantiene el anterior.
    refreshToken: auth.RefreshToken ?? refreshAnterior ?? '',
    expiraEn: Date.now() + auth.ExpiresIn * 1000,
  }
}

/** F24 · Auto-registro: el email es el nombre de usuario. Cognito envía un código de confirmación al correo. */
export async function registrar(email: string, password: string, nombre: string): Promise<void> {
  await llamar('SignUp', {
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'name', Value: nombre },
    ],
  })
}

export async function confirmarRegistro(email: string, codigo: string): Promise<void> {
  await llamar('ConfirmSignUp', { Username: email, ConfirmationCode: codigo })
}

export async function reenviarCodigo(email: string): Promise<void> {
  await llamar('ResendConfirmationCode', { Username: email })
}

/** F25 · Login: devuelve access, id y refresh token. */
export async function iniciarSesion(email: string, password: string): Promise<Tokens> {
  const resultado = await llamar<AuthenticationResult>('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: { USERNAME: email, PASSWORD: password },
  })
  return aTokens(resultado)
}

/** Refresh: pide un access token nuevo con el refresh token, sin volver a pedir la contraseña. */
export async function refrescar(refreshToken: string): Promise<Tokens> {
  const resultado = await llamar<AuthenticationResult>('InitiateAuth', {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  })
  return aTokens(resultado, refreshToken)
}

/** F27 · Olvidé mi contraseña: Cognito envía un código al correo. */
export async function olvideContrasena(email: string): Promise<void> {
  await llamar('ForgotPassword', { Username: email })
}

export async function restablecerContrasena(email: string, codigo: string, nueva: string): Promise<void> {
  await llamar('ConfirmForgotPassword', { Username: email, ConfirmationCode: codigo, Password: nueva })
}

/** F28 · Logout: invalida el refresh token en Cognito (además de borrar la sesión local). */
export async function revocar(refreshToken: string): Promise<void> {
  await llamar('RevokeToken', { Token: refreshToken })
}
