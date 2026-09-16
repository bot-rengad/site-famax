import { NextRequest, NextResponse } from 'next/server'
import { requireClient } from '@/lib/license'
import { requireAdmin } from '@/lib/auth/admin'
import { prisma } from '@/lib/db/prisma'
import { scriptSchema } from '@/lib/validations/schemas'

export async function GET(request: NextRequest) {
  try {
    const session = await requireClient()
    if (!session) {
      return NextResponse.json(
        { error: 'Espace réservé aux clients FMX', code: 'LICENSE_REQUIRED' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const scriptId = searchParams.get('id')

    if (scriptId) {
      const script = await prisma.optimizationScript.findUnique({
        where: { id: scriptId, isActive: true },
      })

      if (!script) {
        return NextResponse.json({ error: 'Script non trouvé' }, { status: 404 })
      }

      // Check if user has access (Pro/Ultimate for advanced scripts)
      const userLicense = await prisma.license.findFirst({
        where: { userId: session.userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      })

      const pkg = userLicense?.packageType || 'BASIC'
      const isAdvanced = ['MSI Utility & Affinity', 'Logiciels Dédiés', 'Réseau', 'Optimisation Jeux']
        .some(cat => script.category.includes(cat))

      if (isAdvanced && pkg === 'BASIC') {
        return NextResponse.json(
          { error: 'Ce script nécessite le pack Pro ou Ultimate', upgradeRequired: true },
          { status: 403 }
        )
      }

      // Increment download count
      await prisma.optimizationScript.update({
        where: { id: script.id },
        data: { downloadCount: { increment: 1 } },
      })

      return NextResponse.json({ script })
    }

    const scripts = await prisma.optimizationScript.findMany({
      where: {
        isActive: true,
        ...(category ? { category: category as any } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    // Group by category
    const grouped = scripts.reduce((acc, script) => {
      if (!acc[script.category]) acc[script.category] = []
      acc[script.category].push(script)
      return acc
    }, {} as Record<string, typeof scripts>)

    return NextResponse.json({ scripts: grouped })
  } catch (error) {
    console.error('Scripts fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des scripts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rôle relu en DB (pas depuis le JWT) — un ex-admin ne doit plus créer de scripts.
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const validation = scriptSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, description, category, content, version, requiresAdmin } = validation.data

    const script = await prisma.optimizationScript.create({
      data: {
        name,
        description,
        category: category as any,
        content,
        version,
        requiresAdmin,
      },
    })

    return NextResponse.json({ script })
  } catch (error) {
    console.error('Script creation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du script' },
      { status: 500 }
    )
  }
}
