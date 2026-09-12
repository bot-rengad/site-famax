import { NextResponse } from 'next/server'
import { clearSessionCookie, getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

async function doLogout() {
  try {
    const session = await getSession()

    if (session?.userId) {
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: 'USER_LOGOUT',
          details: 'Déconnexion',
        },
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
  await clearSessionCookie()
}

export async function POST() {
  await doLogout()
  return NextResponse.json({ message: 'Déconnexion réussie' })
}

// Déconnexion via simple navigation (bouton header) : nettoie puis retour accueil.
export async function GET(request: Request) {
  await doLogout()
  return NextResponse.redirect(new URL('/', request.url))
}