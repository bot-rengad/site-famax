import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { orderSchema } from '@/lib/validations/schemas'
import { generateOrderNumber } from '@/lib/auth/jwt'
import { notifyNewOrder } from '@/lib/discord-notify'
import { PACKAGES, ADDONS } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const validation = orderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { packageType, paymentMethod, addons } = validation.data
    const pkg = PACKAGES.find(p => p.id === packageType)

    if (!pkg) {
      return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
    }

    // Add-ons interdits en Ultime (déjà tout inclus) — et total TOUJOURS
    // recalculé côté serveur, jamais celui envoyé par le client.
    const cleanAddons = packageType === 'ULTIME' ? [] : (addons || [])
    const amount =
      pkg.price + cleanAddons.reduce((sum, id) => sum + (ADDONS.find(a => a.id === id)?.price ?? 0), 0)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        orderNumber: generateOrderNumber(),
        packageType,
        amount,
        currency: 'EUR',
        status: 'PENDING',
        paymentMethod,
        addons: JSON.stringify(cleanAddons),
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'ORDER_CREATED',
        details: `Commande ${order.orderNumber} - Pack ${packageType}`,
      },
    })

    // Notifie le staff sur Discord (webhook salon preuves/logs) — fire & forget
    const buyer = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, discordUsername: true, discordId: true },
    })
    notifyNewOrder({
      orderNumber: order.orderNumber,
      packageType,
      amount,
      paymentMethod,
      addons: cleanAddons,
      discordUsername: buyer?.discordUsername ?? null,
      discordId: buyer?.discordId ?? null,
      email: buyer?.email ?? '',
    }).catch(() => {})

    // La commande reste PENDING : c'est le staff qui la valide (via /admin)
    // après vérification de la preuve de paiement sur Discord.
    // Aucune auto-confirmation côté client.
    return NextResponse.json({
      order,
      message: 'Commande créée, procédez au paiement',
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.userId },
        include: { license: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { userId: session.userId } }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}