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
  // Cookie "Secure" uniquement si le site est servi en HTTPS (sinon impossible de tester en local)
  const isHttps = (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https')
  cookieStore.set('fmx_session', token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 jours : reste connecté même après fermeture du navigateur
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('fmx_session')
}