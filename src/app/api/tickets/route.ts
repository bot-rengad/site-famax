import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { createTicketSchema, ticketMessageSchema } from '@/lib/validations/schemas'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    if (ticketId) {
      const ticket = await prisma.ticket.findFirst({
        where: { id: ticketId, userId: session.userId },
        include: {
          messages: {
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
            orderBy: { createdAt: 'asc' },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      })

      if (!ticket) {
        return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
      }

      return NextResponse.json({ ticket })
    }

    const where: any = { userId: session.userId }
    if (status) where.status = status

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { user: { select: { id: true, name: true, role: true } } },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ])

    return NextResponse.json({
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Tickets fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createTicketSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { subject, description, category, priority } = validation.data

    const ticket = await prisma.ticket.create({
      data: {
        userId: session.userId,
        subject,
        description,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'TICKET_CREATED',
        details: `Ticket créé: ${subject}`,
      },
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Ticket creation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du ticket' }, { status: 500 })
  }
}
