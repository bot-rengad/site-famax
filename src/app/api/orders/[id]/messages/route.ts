import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

// Chat lié à une commande : le client (propriétaire) et le staff (ADMIN)
// peuvent échanger ici au lieu de se perdre entre Discord et tickets.
// Le rôle admin est relu en DB à chaque appel (pas depuis le JWT).
async function getOrderFor(userId: string, orderId: string) {
  const [order, dbUser] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, orderNumber: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ])
  if (!order || !dbUser) return null
  if (dbUser.role === 'ADMIN' || order.userId === userId) return { order, isAdmin: dbUser.role === 'ADMIN' }
  return null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const { id } = await params
    const access = await getOrderFor(session.userId, id)
    if (!access) {
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
    const access = await getOrderFor(session.userId, id)
    if (!access) {
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
        isStaff: access.isAdmin,
      },
      include: { user: { select: { discordGlobalName: true, discordUsername: true, name: true, role: true } } },
    })
    return NextResponse.json({ message: created })
  } catch (error) {
    console.error('Order message send error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
