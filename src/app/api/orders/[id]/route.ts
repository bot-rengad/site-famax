import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

// Détail d'une commande : propriétaire ou ADMIN uniquement.
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
    if (session.role !== 'ADMIN' && order.userId !== session.userId) {
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
