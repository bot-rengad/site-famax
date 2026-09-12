import { prisma } from '@/lib/db/prisma'
import { getSession } from './server'

// Garde admin : rôle relu en BASE à chaque appel (pas depuis le cookie,
// qui peut dater d'avant la nomination → tableaux vides sinon).
export async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  })
  if (!user || user.role !== 'ADMIN') return null
  return session
}
