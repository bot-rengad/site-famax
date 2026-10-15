import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { ticketMessageSchema } from '@/lib/validations/schemas'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('id')

    if (!ticketId) {
      return NextResponse.json({ error: 'ID de ticket requis' }, { status: 400 })
    }

    // Verify ticket belongs to user
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId: session.userId },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    if (ticket.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Ce ticket est fermé. Ouvre un nouveau ticket si tu as besoin d\'aide.' },
        { status: 409 }
      )
    }

    const body = await request.json().catch(() => null)
    const validation = ticketMessageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Message invalide', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId,
        userId: session.userId,
        message: validation.data.message,
        isStaff: false,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    // Le client vient de répondre : OPEN → IN_PROGRESS et WAITING_CUSTOMER → IN_PROGRESS
    // (sans ça le ticket restait bloqué "En attente client" après la réponse).
    const nextStatus = ticket.status === 'OPEN' || ticket.status === 'WAITING_CUSTOMER'
      ? 'IN_PROGRESS'
      : ticket.status
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: nextStatus, updatedAt: new Date() },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'TICKET_MESSAGE_SENT',
        details: `Message envoyé sur ticket ${ticketId}`,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Ticket message error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 })
  }
}
