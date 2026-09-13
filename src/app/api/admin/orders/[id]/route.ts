import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/admin'

// Détail d'une commande pour le staff : commande + client (miroir de l'écran client).
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, discordUsername: true, discordGlobalName: true, discordId: true } },
        license: { select: { key: true, status: true } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }
    let addons: string[] = []
    try {
      const parsed: unknown = JSON.parse(order.addons || '[]')
      if (Array.isArray(parsed)) addons = parsed.filter((x): x is string => typeof x === 'string')
    } catch {
      addons = []
    }
    return NextResponse.json({ order: { ...order, addons } })
  } catch (error) {
    console.error('Admin order detail error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
