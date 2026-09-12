import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Vérifie que la requête provient d'un administrateur authentifié
async function requireAdmin() {
  const { getSession } = await import('@/lib/auth/server')
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

// Liste complète des utilisateurs avec leurs compteurs
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            orders: true,
            licenses: true,
            tickets: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Change le rôle d'un utilisateur (promotion / rétrogradation)
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    // Empêche un admin de se rétrograder lui-même par accident
    if (userId === session.userId && role === 'USER') {
      return NextResponse.json({ error: 'Impossible de modifier votre propre rôle' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Supprime un utilisateur et toutes ses données (cascade Prisma)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    if (!body?.userId || typeof body.userId !== 'string') {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    if (body.userId === session.userId) {
      return NextResponse.json({ error: 'Impossible de supprimer votre propre compte' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: body.userId } })

    return NextResponse.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
