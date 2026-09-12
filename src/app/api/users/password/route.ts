import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { changePasswordSchema } from '@/lib/validations/schemas'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const validation = changePasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newPasswordHash, updatedAt: new Date() },
    })

    // Revoke all other sessions (force re-login)
    await prisma.session.deleteMany({
      where: { userId: session.userId, NOT: { token: session.sessionId } },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PASSWORD_CHANGED',
        details: 'Mot de passe modifié par l\'utilisateur',
      },
    })

    return NextResponse.json({ message: 'Mot de passe modifié avec succès' })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Erreur lors du changement de mot de passe' }, { status: 500 })
  }
}
