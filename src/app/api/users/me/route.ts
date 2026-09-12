import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { profileSchema, userUpdateSchema } from '@/lib/validations/schemas'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        licenses: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { orders: true, tickets: true, checklistProgress: { where: { completed: true } } },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Le dashboard complet est réservé aux clients avec licence active (admins inclus)
    const hasActiveLicense = user.licenses.length > 0 || user.role === 'ADMIN'

    const { passwordHash, ...userWithoutPassword } = user
    return NextResponse.json({ user: { ...userWithoutPassword, hasActiveLicense } })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const validation = userUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Sépare le nom (table User) des champs hardware (table UserProfile)
    const { name, ...profileData } = validation.data

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        updatedAt: new Date(),
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      include: { profile: true },
    })

    const { passwordHash, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
