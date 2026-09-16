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
      // Annuler une commande payée ne doit jamais laisser une licence ACTIVE utilisable.
      const [, updated] = await prisma.$transaction([
        prisma.license.updateMany({
          where: { orderId: order.id, status: 'ACTIVE' },
          data: { status: 'REVOKED' },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', licenseKey: null },
        }),
      ])
      return NextResponse.json({ order: updated, message: 'Commande annulée (licence révoquée si existante)' })
    }

    if (order.status === 'COMPLETED' || order.status === 'PAID') {
      return NextResponse.json({ order, licenseKey: order.licenseKey, message: 'Déjà validée' })
    }
    // Reprise idempotente : si une licence existe déjà pour cette commande (retry après crash),
    // on la réutilise au lieu de lever P2002 sur License(orderId unique).
    if (order.license) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: order.paidAt ?? new Date(), licenseKey: order.license.key },
      })
      return NextResponse.json({ order: updated, licenseKey: order.license.key, message: 'Déjà validée (licence reprise)' })
    }

    const licenseKey = generateLicenseKey()
    // PAID = paiement vérifié. completedAt reste null : la prestation (opti + suivi)
    // n'est pas encore faite. COMPLETED sera posé quand l'intervention est terminée.
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date(), licenseKey },
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
