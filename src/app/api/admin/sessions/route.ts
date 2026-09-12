import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Utilisateurs actuellement connectés : sessions non expirées.
// Regroupés par utilisateur, avec leurs dernières commandes
// (accès direct au chat de chaque commande depuis l'onglet En ligne).
export async function GET() {
  try {
    const { getSession } = await import('@/lib/auth/server')
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const now = new Date()
    const sessions = await prisma.session.findMany({
      where: { expiresAt: { gt: now } },
      orderBy: { lastSeen: 'desc' },
      take: 100,
      select: {
        userId: true,
        lastSeen: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            discordUsername: true,
            discordGlobalName: true,
            discordAvatar: true,
            createdAt: true,
            orders: {
              take: 4,
              orderBy: { createdAt: 'desc' },
              select: { id: true, orderNumber: true, packageType: true, amount: true, status: true, createdAt: true },
            },
          },
        },
      },
    })

    // Regroupe par utilisateur (plusieurs sessions possibles)
    const byUser = new Map<string, { user: (typeof sessions)[number]['user']; sessions: number; lastSeen: Date }>()
    for (const s of sessions) {
      const entry = byUser.get(s.userId)
      if (entry) {
        entry.sessions += 1
        if (s.lastSeen > entry.lastSeen) entry.lastSeen = s.lastSeen
      } else {
        byUser.set(s.userId, { user: s.user, sessions: 1, lastSeen: s.lastSeen })
      }
    }

    return NextResponse.json({
      online: [...byUser.values()].map(e => ({
        ...e,
        lastSeen: e.lastSeen.toISOString(),
        activeNow: Date.now() - e.lastSeen.getTime() < 15 * 60 * 1000,
      })),
    })
  } catch (error) {
    console.error('Admin sessions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
