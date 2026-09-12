import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const sessions = await prisma.session.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    // Parse user agent for device info
    const sessionsWithInfo = sessions.map(s => {
      const ua = s.userAgent || ''
      let deviceType = 'desktop'
      let browser = 'Inconnu'
      let os = 'Inconnu'

      if (/mobile|android|iphone|ipad/i.test(ua)) deviceType = 'mobile'
      else if (/tablet/i.test(ua)) deviceType = 'tablet'

      if (/chrome/i.test(ua)) browser = 'Chrome'
      else if (/firefox/i.test(ua)) browser = 'Firefox'
      else if (/safari/i.test(ua)) browser = 'Safari'
      else if (/edge/i.test(ua)) browser = 'Edge'

      if (/windows/i.test(ua)) os = 'Windows'
      else if (/mac os/i.test(ua)) os = 'macOS'
      else if (/linux/i.test(ua)) os = 'Linux'
      else if (/android/i.test(ua)) os = 'Android'
      else if (/iphone|ipad/i.test(ua)) os = 'iOS'

      return {
        ...s,
        deviceType,
        browser,
        os,
        current: false, // Frontend will determine current session
      }
    })

    return NextResponse.json({ sessions: sessionsWithInfo })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
      return NextResponse.json({ error: 'ID de session requis' }, { status: 400 })
    }

    // Don't allow deleting current session via this endpoint
    if (sessionId === session.sessionId) {
      return NextResponse.json({ error: 'Impossible de révoquer la session actuelle' }, { status: 400 })
    }

    await prisma.session.delete({
      where: { id: sessionId, userId: session.userId },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'SESSION_REVOKED',
        details: `Session révoquée: ${sessionId}`,
      },
    })

    return NextResponse.json({ message: 'Session révoquée' })
  } catch (error) {
    console.error('Session revoke error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
