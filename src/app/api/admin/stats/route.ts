import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

import { requireAdmin } from '@/lib/auth/admin' 

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    // Statistiques globales calculées en parallèle
    // (PAID = validé par le staff, COMPLETED = ancien flux : les deux comptent)
    // Seules les données affichées sont calculées (pas de requêtes inutiles).
    const paidWhere = { status: { in: ['PAID', 'COMPLETED'] } }
    const [totalUsers, totalOrders, revenueAgg, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: paidWhere,
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        revenue: revenueAgg._sum.amount || 0,
      },
      recentOrders,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
