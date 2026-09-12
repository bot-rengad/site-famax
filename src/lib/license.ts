import { prisma } from '@/lib/db/prisma'
import { getSession } from '@/lib/auth/server'

// Vérifie que l'utilisateur connecté possède une licence ACTIVE (client payant)
// Retourne la session si OK, sinon null (la route doit renvoyer 403 LICENSE_REQUIRED)
export async function requireClient() {
  const session = await getSession()
  if (!session) return null

  // Les administrateurs ont accès à tout
  if (session.role === 'ADMIN') return session

  const activeLicense = await prisma.license.findFirst({
    where: { userId: session.userId, status: 'ACTIVE' },
    select: { id: true },
  })

  return activeLicense ? session : null
}
