import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateLicenseKey } from '@/lib/auth/jwt'
import { notifyLicenseActivated } from '@/lib/discord-notify'

import { requireAdmin } from '@/lib/auth/admin' 

// Liste complète des commandes avec client et licence associés
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true, discordUsername: true, discordId: true } },
        license: { select: { key: true, status: true } },
        _count: { select: { messages: true } },
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Validation staff : après vérification de la preuve sur Discord.
// PAID → génère la licence + notifie. CANCELLED → annule la commande.
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    const orderId: string | undefined = body?.orderId
    const action: string | undefined = body?.action

    if (!orderId || (action !== 'PAID' && action !== 'CANCELLED')) {
      return NextResponse.json({ error: 'orderId + action (PAID|CANCELLED) requis' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { license: true, user: { select: { discordUsername: true } } },
    })
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    if (action === 'CANCELLED') {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json({ order: updated, message: 'Commande annulée' })
    }

    if (order.status === 'COMPLETED' || order.status === 'PAID') {
      return NextResponse.json({ order, licenseKey: order.licenseKey, message: 'Déjà validée' })
    }

    const licenseKey = generateLicenseKey()
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date(), completedAt: new Date(), licenseKey },
      }),
      prisma.license.create({
        data: {
          key: licenseKey,
          userId: order.userId,
          orderId: order.id,
          packageType: order.packageType,
          status: 'ACTIVE',
          activatedAt: new Date(),
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: order.userId,
          action: 'PAYMENT_VALIDATED',
          details: `Paiement validé par ${session.userId} - ${order.orderNumber}`,
        },
      }),
    ])

    notifyLicenseActivated(order.orderNumber, licenseKey, order.user?.discordUsername ?? null).catch(() => {})

    return NextResponse.json({ order: updatedOrder, licenseKey, message: 'Paiement validé, licence générée' })
  } catch (error) {
    console.error('Admin order validate error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
