import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

// Chat lié à une commande : le client (propriétaire) et le staff (ADMIN)
// peuvent échanger ici au lieu de se perdre entre Discord et tickets.
async function getOrderFor(userId: string, role: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, orderNumber: true },
  })
  if (!order) return null
  if (role === 'ADMIN' || order.userId === userId) return order
  return null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { id } = await params
    const order = await getOrderFor(session.userId, session.role, id)
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const messages = await prisma.orderMessage.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'asc' },
      take: 200,
      include: { user: { select: { discordGlobalName: true, discordUsername: true, name: true, role: true } } },
    })
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Order messages fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { id } = await params
    const order = await getOrderFor(session.userId, session.role, id)
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 2000) : ''
    if (message.length < 1) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    const created = await prisma.orderMessage.create({
      data: {
        orderId: id,
        userId: session.userId,
        message,
        isStaff: session.role === 'ADMIN',
      },
      include: { user: { select: { discordGlobalName: true, discordUsername: true, name: true, role: true } } },
    })
    return NextResponse.json({ message: created })
  } catch (error) {
    console.error('Order message send error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
