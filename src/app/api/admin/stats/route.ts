import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Vérifie que la requête provient d'un administrateur authentifié
async function requireAdmin() {
  const { getSession } = await import('@/lib/auth/server')
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    // Statistiques globales calculées en parallèle
    const [
      totalUsers,
      totalOrders,
      completedOrders,
      activeLicenses,
      openTickets,
      revenueAgg,
      recentOrders,
      recentUsers,
      checklistStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.license.count({ where: { status: 'ACTIVE' } }),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.userChecklistProgress.groupBy({
        by: ['completed'],
        _count: true,
      }),
    ])

    const completedProgress = checklistStats.find(s => s.completed === true)?._count || 0

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        completedOrders,
        activeLicenses,
        openTickets,
        revenue: revenueAgg._sum.amount || 0,
        checklistCompletion: completedProgress,
      },
      recentOrders,
      recentUsers,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
