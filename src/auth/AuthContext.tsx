import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { iniciarSesion, refrescar, revocar, type Tokens } from './cognitoApi'
import { leerClaims } from './jwt'

const CLAVE_SESION = 'portal-valparaiso.sesion'
/** Se refresca el access token si le queda menos de un minuto. */
const MARGEN_MS = 60_000

export interface Huesped {
  sub: string
  email: string
  nombre: string
  /** Grupos del User Pool (el rol): CLIENTE para todo huésped registrado. */
  grupos: string[]
}

interface ValorAuth {
  huesped: Huesped | null
  tokens: Tokens | null
  ingresar: (email: string, password: string) => Promise<void>
  salir: () => Promise<void>
  /** Access token vigente para llamar a las rutas /cliente; lo refresca si está por vencer. */
  accessToken: () => Promise<string | null>
}

const AuthContext = createContext<ValorAuth | null>(null)

function leerSesion(): Tokens | null {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION)
    return guardada ? (JSON.parse(guardada) as Tokens) : null
  } catch {
    return null
  }
}

function guardarSesion(tokens: Tokens | null): void {
  try {
    if (tokens) localStorage.setItem(CLAVE_SESION, JSON.stringify(tokens))
    else localStorage.removeItem(CLAVE_SESION)
  } catch {
    // Sin almacenamiento (modo privado): la sesión dura lo que dure la pestaña.
  }
}

function aHuesped(tokens: Tokens | null): Huesped | null {
  if (!tokens) return null
  const id = leerClaims(tokens.idToken)
  const access = leerClaims(tokens.accessToken)
  return {
    sub: String(access.sub ?? id.sub ?? ''),
    email: String(id.email ?? ''),
    nombre: String(id.name ?? id.email ?? ''),
    grupos: Array.isArray(access['cognito:groups']) ? access['cognito:groups'] : [],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<Tokens | null>(leerSesion)
  const refrescando = useRef<Promise<Tokens | null> | null>(null)

  const actualizar = useCallback((nuevos: Tokens | null) => {
    guardarSesion(nuevos)
    setTokens(nuevos)
  }, [])

  const ingresar = useCallback(
    async (email: string, password: string) => {
      actualizar(await iniciarSesion(email.trim().toLowerCase(), password))
    },
    [actualizar],
  )

  const salir = useCallback(async () => {
    const refresh = tokens?.refreshToken
    // F28: la sesión local se descarta siempre, aunque Cognito no responda.
    actualizar(null)
    if (refresh) await revocar(refresh).catch(() => undefined)
  }, [tokens, actualizar])

  const accessToken = useCallback(async () => {
    if (!tokens) return null
    if (tokens.expiraEn - Date.now() > MARGEN_MS) return tokens.accessToken
    // Si varias llamadas piden token a la vez, se refresca una sola vez.
    refrescando.current ??= refrescar(tokens.refreshToken)
      .then((nuevos) => {
        actualizar(nuevos)
        return nuevos
      })
      .catch(() => {
        // Refresh vencido o revocado: hay que volver a iniciar sesión.
        actualizar(null)
        return null
      })
      .finally(() => {
        refrescando.current = null
      })
    return (await refrescando.current)?.accessToken ?? null
  }, [tokens, actualizar])

  const valor = useMemo<ValorAuth>(
    () => ({ huesped: aHuesped(tokens), tokens, ingresar, salir, accessToken }),
    [tokens, ingresar, salir, accessToken],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): ValorAuth {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return valor
}
