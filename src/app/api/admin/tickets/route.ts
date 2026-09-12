import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Vérifie que la requête provient d'un administrateur authentifié
async function requireAdmin() {
  const { getSession } = await import('@/lib/auth/server')
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

// Liste complète des tickets support avec messages
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, message: true, isStaff: true, createdAt: true },
        },
      },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Admin tickets error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Répond à un ticket (message staff) et passe son statut en IN_PROGRESS
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    const { ticketId, message, status } = body

    if (!ticketId || !message || typeof message !== 'string') {
      return NextResponse.json({ error: 'ticketId et message requis' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
    }

    // Enregistre la réponse du staff et met à jour le statut si fourni
    const [, updatedTicket] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId,
          userId: session.userId,
          message,
          isStaff: true,
        },
      }),
      prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: status || 'IN_PROGRESS',
          updatedAt: new Date(),
        },
        include: {
          user: { select: { email: true, name: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      }),
    ])

    return NextResponse.json({ ticket: updatedTicket, message: 'Réponse envoyée' })
  } catch (error) {
    console.error('Admin ticket reply error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Change uniquement le statut d'un ticket (fermeture rapide)
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'CLOSED']

    if (!body?.ticketId || !validStatuses.includes(body?.status)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const ticket = await prisma.ticket.update({
      where: { id: body.ticketId },
      data: {
        status: body.status,
        closedAt: body.status === 'CLOSED' ? new Date() : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Admin ticket status error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
