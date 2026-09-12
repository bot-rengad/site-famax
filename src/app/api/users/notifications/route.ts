import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    // In a real app, store in user preferences table
    // For now, just log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'NOTIFICATION_PREF_CHANGED',
        details: `Notification ${key} = ${value}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification pref error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
