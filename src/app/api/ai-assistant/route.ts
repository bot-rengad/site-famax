import { NextRequest, NextResponse } from 'next/server'
import { requireClient } from '@/lib/license'
import { prisma } from '@/lib/db/prisma'
import { aiQuerySchema } from '@/lib/validations/schemas'
import { CHECKLIST_CATEGORIES } from '@/lib/checklist-categories'

// AI Knowledge Base - Maps issues to solutions
// scriptMatch : mot-clé recherché dans les noms des scripts réels en DB.
// (Les anciens IDs en dur du type `disable_core_isolation` n'existaient pas
// en base → le bouton "Voir script" était un lien mort.)
const AI_KNOWLEDGE_BASE = {
  'micro-freeze': {
    category: 'system-registry' as const,
    title: 'Désactiver Core Isolation (Memory Integrity)',
    description: 'La protection de la mémoire (Core Isolation) cause souvent des micro-freeze en jeu. Désactive-la dans Sécurité Windows.',
    priority: 'high' as const,
    scriptMatch: 'core isolation',
  },
  'high-ping': {
    category: 'network' as const,
    title: 'Optimiser la configuration réseau',
    description: 'Désactiver Green Ethernet, forcer Speed/Duplex 1Gbps, configurer DNS Cloudflare 1.1.1.1, purger DNS/Winsock.',
    priority: 'high' as const,
    scriptMatch: 'dns cloudflare',
  },
  'low-fps': {
    category: 'nvidia-drivers' as const,
    title: 'Configurer Panneau NVIDIA pour performances maximales',
    description: 'Mode gestion alimentation: Performance maximale, Faible latence: Ultra, Qualité: Haute performance, Optimisation threadée: Activé.',
    priority: 'high' as const,
    scriptMatch: 'nvidia',
  },
  'input-lag': {
    category: 'msi-affinity' as const,
    title: 'Activer MSI et configurer l\'affinité CPU',
    description: 'Activer MSI sur GPU/Ethernet/USB, configurer IntPolicy.exe (masque sans cœurs 0/1), dédier un cœur au jeu.',
    priority: 'high' as const,
    scriptMatch: 'msi gpu',
  },
  'stutter': {
    category: 'dedicated-software' as const,
    title: 'Configurer ISLC Timer Resolution 0.5ms',
    description: 'ISLC (Intelligent Standby List Cleaner) avec timer resolution 0.5ms, seuils RAM selon ta config (1024MB pour 32GB).',
    priority: 'medium' as const,
    scriptMatch: 'islc',
  },
  'cpu-usage': {
    category: 'system-registry' as const,
    title: 'Désactiver services inutiles et télémétrie',
    description: 'Debloat Windows, désactiver télémétrie, services d\'arrière-plan, optimisation registre Tasks/Games GPU Priority.',
    priority: 'medium' as const,
    scriptMatch: 'debloat',
  },
  'packet-loss': {
    category: 'network' as const,
    title: 'QoS Gaming et optimisation TCP/IP',
    description: 'Configurer QoS pour prioriser le trafic gaming, optimiser MTU, désactiver Nagle Algorithm, TCP Window Scaling.',
    priority: 'medium' as const,
    scriptMatch: 'qos',
  },
  'crash': {
    category: 'security' as const,
    title: 'Créer point de restauration et vérifier stabilité',
    description: 'Avant toute optimisation majeure, créer un point de restauration. Vérifier XMP/EXPO, températures, alimentation.',
    priority: 'high' as const,
    scriptMatch: 'restauration',
  },
}

function analyzeQuery(
  query: string,
  context?: any,
  scripts: { id: string; name: string }[] = []
): { analysis: string; recommendations: any[]; quickActions: any[] } {
  const lowerQuery = query.toLowerCase()
  const matchedIssues: string[] = []

  // Simple keyword matching
  Object.keys(AI_KNOWLEDGE_BASE).forEach(issue => {
    const keywords = issue.split('-')
    if (keywords.some(k => lowerQuery.includes(k)) || lowerQuery.includes(issue)) {
      matchedIssues.push(issue)
    }
  })

  // Additional context-based matching
  if (context?.gpu?.toLowerCase().includes('nvidia') && (lowerQuery.includes('lag') || lowerQuery.includes('latence'))) {
    if (!matchedIssues.includes('input-lag')) matchedIssues.push('input-lag')
  }

  if (context?.ram && parseInt(context.ram) >= 32 && lowerQuery.includes('stutter')) {
    if (!matchedIssues.includes('stutter')) matchedIssues.push('stutter')
  }

  // Default to general optimization if no matches
  if (matchedIssues.length === 0) {
    matchedIssues.push('low-fps', 'input-lag', 'high-ping')
  }

  const recommendations = matchedIssues.slice(0, 3).map(issue => {
    const kb = AI_KNOWLEDGE_BASE[issue as keyof typeof AI_KNOWLEDGE_BASE]
    const categoryInfo = CHECKLIST_CATEGORIES.find(c => c.id === kb.category)
    // Résout un vrai script DB par mot-clé (id + nom affichable) ; absent =
    // pas de bouton script (mieux qu'un lien mort).
    const script = scripts.find(s => s.name.toLowerCase().includes(kb.scriptMatch))
    return {
      ...kb,
      category: kb.category,
      categoryName: categoryInfo?.name || kb.category,
      scriptId: script?.id,
      scriptName: script?.name,
    }
  })

  const analysis = `Analyse de ton problème : "${query}". ${matchedIssues.length > 1 
    ? `J'ai identifié ${matchedIssues.length} causes potentielles principales.` 
    : 'J\'ai identifié une cause principale probable.'}
    ${context ? `Configuration détectée : ${context.cpu || 'N/A'} / ${context.gpu || 'N/A'} / ${context.ram || 'N/A'} RAM.` : ''}`

  const quickActions: { label: string; action: string; payload: Record<string, unknown> }[] = [
    { label: 'Être accompagné sur Discord', action: 'create_ticket', payload: { subject: query } },
  ]

  return { analysis, recommendations, quickActions }
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

    const body = await request.json().catch(() => null)
    const validation = aiQuerySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Requête invalide', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { query, context } = validation.data

    // Profil matériel + scripts réels (pour des liens qui existent vraiment)
    const [profile, scripts] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: session.userId } }),
      prisma.optimizationScript.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
    ])

    const mergedContext = {
      ...profile,
      ...context,
    }

    const result = analyzeQuery(query, mergedContext, scripts)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'AI_ASSISTANT_QUERY',
        details: `Requête IA: ${query.substring(0, 100)}`,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI Assistant error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse IA' },
      { status: 500 }
    )
  }
}
