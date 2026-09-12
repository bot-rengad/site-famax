import { NextRequest, NextResponse } from 'next/server'
import { requireClient } from '@/lib/license'
import { prisma } from '@/lib/db/prisma'
import { aiQuerySchema } from '@/lib/validations/schemas'
import { CHECKLIST_CATEGORIES } from '@/lib/checklist-categories'

// AI Knowledge Base - Maps issues to solutions
const AI_KNOWLEDGE_BASE = {
  'micro-freeze': {
    category: 'system-registry' as const,
    title: 'Désactiver Core Isolation (Memory Integrity)',
    description: 'La protection de la mémoire (Core Isolation) cause souvent des micro-freeze en jeu. Désactivez-la dans Sécurité Windows.',
    priority: 'high' as const,
    scriptId: 'disable_core_isolation',
    checklistItemIds: ['system-registry-core-isolation'],
  },
  'high-ping': {
    category: 'network' as const,
    title: 'Optimiser la configuration réseau',
    description: 'Désactiver Green Ethernet, forcer Speed/Duplex 1Gbps, configurer DNS Cloudflare 1.1.1.1, purger DNS/Winsock.',
    priority: 'high' as const,
    scriptId: 'network_optimize',
    checklistItemIds: ['network-green-ethernet', 'network-dns', 'network-purge'],
  },
  'low-fps': {
    category: 'nvidia-drivers' as const,
    title: 'Configurer Panneau NVIDIA pour performances maximales',
    description: 'Mode gestion alimentation: Performance maximale, Faible latence: Ultra, Qualité: Haute performance, Optimisation threadée: Activé.',
    priority: 'high' as const,
    scriptId: 'nvidia_settings',
    checklistItemIds: ['nvidia-power-management', 'nvidia-low-latency', 'nvidia-threaded-opt'],
  },
  'input-lag': {
    category: 'msi-affinity' as const,
    title: 'Activer MSI et configurer l\'affinité CPU',
    description: 'Activer MSI sur GPU/Ethernet/USB, configurer IntPolicy.exe (masque sans cœurs 0/1), dédier un cœur au jeu.',
    priority: 'high' as const,
    scriptId: 'gpu_msi_enable',
    checklistItemIds: ['msi-gpu', 'msi-ethernet', 'affinity-intpolicy'],
  },
  'stutter': {
    category: 'dedicated-software' as const,
    title: 'Configurer ISLC Timer Resolution 0.5ms',
    description: 'ISLC (Intelligent Standby List Cleaner) avec timer resolution 0.5ms, seuils RAM selon votre config (1024MB pour 32GB).',
    priority: 'medium' as const,
    scriptId: 'islc_config',
    checklistItemIds: ['islc-timer', 'islc-ram-threshold'],
  },
  'cpu-usage': {
    category: 'system-registry' as const,
    title: 'Désactiver services inutiles et télémétrie',
    description: 'Debloat Windows, désactiver télémétrie, services d\'arrière-plan, optimisation registre Tasks/Games GPU Priority.',
    priority: 'medium' as const,
    scriptId: 'debloat',
    checklistItemIds: ['registry-gpu-priority', 'debloat-services', 'disable-telemetry'],
  },
  'packet-loss': {
    category: 'network' as const,
    title: 'QoS Gaming et optimisation TCP/IP',
    description: 'Configurer QoS pour prioriser le trafic gaming, optimiser MTU, désactiver Nagle Algorithm, TCP Window Scaling.',
    priority: 'medium' as const,
    scriptId: 'qos_gaming',
    checklistItemIds: ['network-qos', 'network-mtu', 'network-tcp-optimization'],
  },
  'crash': {
    category: 'security' as const,
    title: 'Créer point de restauration et vérifier stabilité',
    description: 'Avant toute optimisation majeure, créer un point de restauration. Vérifier XMP/EXPO, températures, alimentation.',
    priority: 'high' as const,
    scriptId: 'restore_point',
    checklistItemIds: ['security-restore-point', 'hardware-xmp', 'hardware-temperatures'],
  },
}

function analyzeQuery(query: string, context?: any): { analysis: string; recommendations: any[]; quickActions: any[] } {
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
    return {
      ...kb,
      category: kb.category,
      categoryName: categoryInfo?.name || kb.category,
    }
  })

  const analysis = `Analyse de votre problème : "${query}". ${matchedIssues.length > 1 
    ? `J'ai identifié ${matchedIssues.length} causes potentielles principales.` 
    : 'J\'ai identifié une cause principale probable.'}
    ${context ? `Configuration détectée : ${context.cpu || 'N/A'} / ${context.gpu || 'N/A'} / ${context.ram || 'N/A'} RAM.` : ''}`

  const quickActions: { label: string; action: string; payload: Record<string, unknown> }[] = recommendations.map(rec => ({
    label: rec.title,
    action: rec.scriptId ? 'run_script' : 'open_checklist',
    payload: rec.scriptId ? { scriptId: rec.scriptId } : { category: rec.category },
  }))

  // Add generic actions
  quickActions.push(
    { label: 'Ouvrir Checklist complète', action: 'open_checklist', payload: {} },
    { label: 'Télécharger tous les scripts', action: 'open_downloads', payload: {} },
    { label: 'Créer un ticket support', action: 'create_ticket', payload: { subject: query } }
  )

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

    const body = await request.json()
    const validation = aiQuerySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Requête invalide', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { query, context } = validation.data

    // Get user profile for context
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    })

    const mergedContext = {
      ...profile,
      ...context,
    }

    const result = analyzeQuery(query, mergedContext)

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
