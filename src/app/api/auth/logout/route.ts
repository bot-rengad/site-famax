import { NextResponse } from 'next/server'
import { clearSessionCookie, getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export async function POST() {
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

    await clearSessionCookie()

    return NextResponse.json({ message: 'Déconnexion réussie' })
  } catch (error) {
    console.error('Logout error:', error)
    await clearSessionCookie()
    return NextResponse.json({ message: 'Déconnexion réussie' })
  }
}