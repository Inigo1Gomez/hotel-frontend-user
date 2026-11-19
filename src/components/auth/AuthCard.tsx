import type { ReactNode } from 'react'
import { COGNITO_ENABLED } from '@/auth/cognitoApi'

interface AuthCardProps {
  eyebrow: string
  title: string
  lede?: string
  children: ReactNode
  footer?: ReactNode
}

/** Marco común de las pantallas de cuenta (ingresar, registro, recuperar). */
export function AuthCard({ eyebrow, title, lede, children, footer }: AuthCardProps) {
  return (
    <section className="section auth-section">
      <div className="container auth-container">
        <div className="auth-card">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="auth-title">{title}</h1>
          {lede ? <p className="auth-lede">{lede}</p> : null}
          {COGNITO_ENABLED ? (
            children
          ) : (
            <p className="auth-alert is-error">
              Las cuentas de huésped no están configuradas en este sitio (falta VITE_COGNITO_CLIENT_ID). Puedes reservar
              igual como invitado.
            </p>
          )}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>
      </div>
    </section>
  )
}

export function AuthAlert({ tone, children }: { tone: 'error' | 'ok' | 'info'; children: ReactNode }) {
  return (
    <p className={`auth-alert is-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

/** Misma política que el User Pool: 8+ caracteres con mayúscula, minúscula, número y símbolo. */
export function contrasenaValida(password: string): boolean {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)
}

export const AYUDA_CONTRASENA = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.'
