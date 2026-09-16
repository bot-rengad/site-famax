import { cookies } from 'next/headers'
import { verifyToken, TokenPayload } from './jwt'

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('fmx_session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  // Secure dès que NODE_ENV=production (jamais basé sur NEXT_PUBLIC_APP_URL,
  // qui peut rester en http par oubli et exposerait le cookie en clair).
  const isProd = process.env.NODE_ENV === 'production'
  cookieStore.set('fmx_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours : aligné sur l'expiration JWT (7d) et la session DB (7j)
    path: '/',
  })
  // Marqueur lisible en JS (le cookie de session est httpOnly donc invisible
  // pour document.cookie) : le header sait s'il doit charger le profil,
  // sans taper l'API pour chaque visiteur anonyme.
  cookieStore.set('fmx_logged_in', '1', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('fmx_session')
  cookieStore.delete('fmx_logged_in')
}