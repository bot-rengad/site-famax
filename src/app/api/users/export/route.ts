import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        licenses: true,
        orders: { include: { license: true } },
        tickets: { include: { messages: true } },
        checklistProgress: { include: { checklistItem: true } },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 100 },
        sessions: { select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const { passwordHash, ...userData } = user

    // Add metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: userData,
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="fmx-export-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
  }
}
