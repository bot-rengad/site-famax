import { NextRequest, NextResponse } from 'next/server'
import { requireClient } from '@/lib/license'
import { prisma } from '@/lib/db/prisma'
import { checklistProgressSchema } from '@/lib/validations/schemas'

export async function GET(request: NextRequest) {
  try {
    const session = await requireClient()
    if (!session) {
      return NextResponse.json(
        { error: 'Espace réservé aux clients FMX', code: 'LICENSE_REQUIRED' },
        { status: 403 }
      )
    }

    // Get all checklist items with user progress
    const items = await prisma.checklistItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: {
        userProgress: {
          where: { userId: session.userId },
        },
      },
    })

    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      const progress = item.userProgress[0]
      acc[item.category].push({
        ...item,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt || null,
        notes: progress?.notes || null,
      })
      return acc
    }, {} as Record<string, Array<(typeof items)[number] & { completed: boolean; completedAt: Date | null; notes: string | null }>>)

    // Calculate stats
    const total = items.length
    const completed = items.filter(item => item.userProgress[0]?.completed).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    return NextResponse.json({
      checklist: grouped,
      stats: { total, completed, percent },
    })
  } catch (error) {
    console.error('Checklist fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la checklist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireClient()
    if (!session) {
      return NextResponse.json(
        { error: 'Espace réservé aux clients FMX', code: 'LICENSE_REQUIRED' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = checklistProgressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { checklistItemId, completed, notes } = validation.data

    // Verify item exists
    const item = await prisma.checklistItem.findUnique({
      where: { id: checklistItemId, isActive: true },
    })

    if (!item) {
      return NextResponse.json({ error: 'Élément de checklist non trouvé' }, { status: 404 })
    }

    // Upsert progress
    const progress = await prisma.userChecklistProgress.upsert({
      where: {
        userId_checklistItemId: {
          userId: session.userId,
          checklistItemId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        notes,
      },
      create: {
        userId: session.userId,
        checklistItemId,
        completed,
        completedAt: completed ? new Date() : null,
        notes,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: completed ? 'CHECKLIST_ITEM_COMPLETED' : 'CHECKLIST_ITEM_UNCHECKED',
        details: `${item.title} - ${completed ? 'Complété' : 'Décoché'}`,
      },
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Checklist progress error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la progression' },
      { status: 500 }
    )
  }
}
