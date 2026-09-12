import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

import { requireAdmin } from '@/lib/auth/admin' 

// Liste complète des licences avec propriétaires
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const licenses = await prisma.license.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
        order: { select: { orderNumber: true } },
      },
    })

    return NextResponse.json({ licenses })
  } catch (error) {
    console.error('Admin licenses error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Active ou révoque une licence (toggle du statut)
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    if (!body?.licenseId || typeof body.licenseId !== 'string') {
      return NextResponse.json({ error: 'licenseId requis' }, { status: 400 })
    }

    const license = await prisma.license.findUnique({
      where: { id: body.licenseId },
    })

    if (!license) {
      return NextResponse.json({ error: 'Licence introuvable' }, { status: 404 })
    }

    // Bascule entre ACTIVE et REVOKED
    const newStatus = license.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE'

    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        status: newStatus,
        activatedAt: newStatus === 'ACTIVE' ? new Date() : license.activatedAt,
      },
    })

    return NextResponse.json({ license: updated, message: `Licence ${newStatus === 'ACTIVE' ? 'réactivée' : 'révoquée'}` })
  } catch (error) {
    console.error('Admin license toggle error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
