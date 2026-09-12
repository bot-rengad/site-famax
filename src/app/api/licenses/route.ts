import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const licenseId = searchParams.get('id')

    if (licenseId) {
      const license = await prisma.license.findFirst({
        where: { id: licenseId, userId: session.userId },
        include: { order: true },
      })

      if (!license) {
        return NextResponse.json({ error: 'Licence non trouvée' }, { status: 404 })
      }

      // Generate QR code for license key
      const qrCode = await QRCode.toDataURL(license.key, {
        width: 200,
        margin: 2,
        color: {
          dark: '#ff1a1a',
          light: '#080808',
        },
      })

      return NextResponse.json({ license, qrCode })
    }

    const licenses = await prisma.license.findMany({
      where: { userId: session.userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ licenses })
  } catch (error) {
    console.error('Licenses fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des licences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { key, deviceId } = body

    if (!key) {
      return NextResponse.json({ error: 'Clé de licence requise' }, { status: 400 })
    }

    const license = await prisma.license.findUnique({
      where: { key },
      include: { user: true },
    })

    if (!license) {
      return NextResponse.json({ error: 'Licence invalide' }, { status: 404 })
    }

    if (license.userId !== session.userId) {
      return NextResponse.json({ error: 'Cette licence ne vous appartient pas' }, { status: 403 })
    }

    if (license.status !== 'ACTIVE') {
      return NextResponse.json({ error: `Licence ${license.status.toLowerCase()}` }, { status: 400 })
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      await prisma.license.update({
        where: { id: license.id },
        data: { status: 'EXPIRED' },
      })
      return NextResponse.json({ error: 'Licence expirée' }, { status: 400 })
    }

    // Activate license if not already activated
    if (!license.activatedAt) {
      await prisma.license.update({
        where: { id: license.id },
        data: {
          activatedAt: new Date(),
          deviceId: deviceId || license.deviceId,
        },
      })
    } else if (deviceId && license.deviceId !== deviceId) {
      // In a real app, you might want to handle device changes differently
      // For now, we'll allow it but log it
      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: 'LICENSE_DEVICE_CHANGE',
          details: `Changement d'appareil pour licence ${license.key}: ${license.deviceId} -> ${deviceId}`,
        },
      })
      await prisma.license.update({
        where: { id: license.id },
        data: { deviceId },
      })
    }

    return NextResponse.json({
      license: { ...license, activatedAt: license.activatedAt || new Date() },
      message: 'Licence validée avec succès',
    })
  } catch (error) {
    console.error('License validation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation de la licence' },
      { status: 500 }
    )
  }
}
