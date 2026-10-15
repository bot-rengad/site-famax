import { cookies } from 'next/headers'
import { verifyToken, TokenPayload } from './jwt'
import { prisma } from '@/lib/db/prisma'

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('fmx_session')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null

  // La signature JWT seule ne suffit pas : on vérifie que la session existe
  // toujours en DB (révocable depuis les paramètres) et n'est pas expirée.
  // Sans ce contrôle, un token volé restait valide 7 jours malgré la révocation.
  try {
    const dbSession = await prisma.session.findUnique({
      where: { token: payload.sessionId },
      select: { expiresAt: true },
    })
    if (!dbSession || dbSession.expiresAt.getTime() < Date.now()) return null
  } catch {
    // DB injoignable : on refuse par prudence (le reste de l'app est de toute
    // façon inutilisable sans DB).
    return null
  }

  return payload
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