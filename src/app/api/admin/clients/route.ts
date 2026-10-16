import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/admin'

// Vue "Clients" du panel admin : chaque compte avec son statut de connexion,
// ses infos Discord et la config matérielle qu'il a remplie.
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const now = new Date()
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        discordId: true,
        discordUsername: true,
        discordGlobalName: true,
        discordAvatar: true,
        discordVerifiedAt: true,
        profile: {
          select: {
            cpu: true,
            gpu: true,
            ram: true,
            motherboard: true,
            storage: true,
            os: true,
            favoriteGame: true,
            monitorRefresh: true,
            mouseDPI: true,
            keyboardPolling: true,
            cpuCores: true,
            gpuRenderer: true,
            autoDetected: true,
            updatedAt: true,
          },
        },
        // Sessions non expirées uniquement pour le statut "connecté"
        sessions: {
          where: { expiresAt: { gt: now } },
          orderBy: { lastSeen: 'desc' },
          take: 5,
          select: { lastSeen: true, createdAt: true, ipAddress: true, userAgent: true },
        },
        _count: { select: { orders: true, licenses: true, tickets: true, sessions: true } },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: { id: true, orderNumber: true, packageType: true, amount: true, status: true, createdAt: true },
        },
        licenses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { key: true, status: true, packageType: true },
        },
      },
    })

    const clients = users.map(u => {
      const lastSeen = u.sessions[0]?.lastSeen ?? null
      const activeSessions = u.sessions.length
      const status: 'online' | 'recent' | 'offline' = lastSeen && now.getTime() - lastSeen.getTime() < 15 * 60 * 1000
        ? 'online'
        : lastSeen && now.getTime() - lastSeen.getTime() < 24 * 60 * 60 * 1000
          ? 'recent'
          : 'offline'
      return {
        ...u,
        sessions: activeSessions,
        lastSeen: lastSeen ? lastSeen.toISOString() : null,
        lastIp: u.sessions[0]?.ipAddress ?? null,
        status,
      }
    }).sort((a, b) => {
      const rank = { online: 0, recent: 1, offline: 2 } as const
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status]
      if (a.lastSeen && b.lastSeen) return b.lastSeen.localeCompare(a.lastSeen)
      if (a.lastSeen) return -1
      if (b.lastSeen) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Admin clients error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
