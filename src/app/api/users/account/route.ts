import { NextRequest, NextResponse } from 'next/server'
import { getSession, clearSessionCookie } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Delete user and all related data (cascade via Prisma schema)
    await prisma.user.delete({
      where: { id: session.userId },
    })

    // Clear session cookie
    await clearSessionCookie()

    return NextResponse.json({ message: 'Compte supprimé avec succès' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}