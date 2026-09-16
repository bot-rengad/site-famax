import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

// Détail d'une commande : propriétaire ou ADMIN uniquement (rôle relu en DB,
// jamais depuis le JWT qui peut dater d'avant une rétrogradation).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { license: { select: { key: true, status: true } } },
    })
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }
    const dbUser = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    const isAdmin = dbUser?.role === 'ADMIN'
    if (!isAdmin && order.userId !== session.userId) {
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
    console.error('Order detail error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Annulation par le client : sa propre commande, uniquement si encore en attente.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { id } = await params
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order || order.userId !== session.userId) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Seule une commande en attente peut être annulée' }, { status: 400 })
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
    await prisma.activityLog.create({
      data: { userId: session.userId, action: 'ORDER_CANCELLED', details: `Annulée par le client - ${order.orderNumber}` },
    }).catch(() => {})
    // Normalise les add-ons en tableau (le client attend string[], pas du JSON brut)
    let addons: string[] = []
    try {
      const parsed: unknown = JSON.parse(updated.addons || '[]')
      if (Array.isArray(parsed)) addons = parsed.filter((x): x is string => typeof x === 'string')
    } catch {
      addons = []
    }
    return NextResponse.json({ order: { ...updated, addons }, message: 'Commande annulée' })
  } catch (error) {
    console.error('Order cancel error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
