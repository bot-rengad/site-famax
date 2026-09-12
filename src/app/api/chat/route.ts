import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================================
// Moteur de chatbot FMX — 100% local, aucune clé API requise.
// Détection d'intention par score de mots-clés sur texte normalisé.
// Règle absolue : on ne dévoile AUCUNE méthode d'optimisation,
// uniquement des résultats et des informations commerciales.
// ============================================================

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  // Configuration détectée côté navigateur pour personnaliser les réponses
  context: z.object({
    gpuModel: z.string().nullable().optional(),
    cpuCores: z.number().int().nullable().optional(),
    ramGB: z.number().nullable().optional(),
    os: z.string().nullable().optional(),
    refreshRateHz: z.number().nullable().optional(),
  }).nullable().optional(),
})

interface Intent {
  id: string
  keywords: string[]
  answer: (ctx?: { gpuModel?: string | null; cpuCores?: number | null; ramGB?: number | null; os?: string | null; refreshRateHz?: number | null }) => string
  quickReplies?: string[]
}

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keywords: ['bonjour', 'salut', 'hello', 'yo', 'coucou', 'hey', 'bonsoir', 'wesh'],
    answer: () =>
      "Salut ! Bienvenue chez FMX Optimisation. Je suis l'assistant FMX, je peux te renseigner sur nos offres (Basic 20€, Complet 25€, Ultime 50€), le déroulé (diagnostic UserDiag + avis staff, 15 min à distance), ou t'aider à diagnostiquer tes problèmes de performance. Que veux-tu savoir ?",
    quickReplies: ['Ça coûte combien ?', 'Comment ça se passe ?', 'Compatible avec mon PC ?', 'Chutes de FPS'],
  },
  {
    id: 'price',
    keywords: ['prix', 'coute', 'cout', 'tarif', 'combien', 'euro', 'eur', 'payement', 'paiement', 'cher', 'abonnement', 'gratuit', 'essai'],
    answer: () =>
      "Nos tarifs : **Pack Basic 20€, Pack Complet 25€, Pack Ultime 50€ — paiement unique**, pas d'abonnement. Tu peux payer par **PayPal** (Amis & Proches, pseudo Discord en note) ou **virement** (IBAN BE, motif = pseudo Discord). Tout se valide sur Discord avec ta preuve de paiement.",
    quickReplies: ['Quels moyens de paiement ?', 'Il y a un remboursement ?', 'Je commande où ?'],
  },
  {
    id: 'payment',
    keywords: ['paypal', 'carte', 'visa', 'mastercard', 'virement', 'rib', 'iban', 'moyens de paiement', 'payer'],
    answer: () =>
      "Tu peux payer par **PayPal** (envoi en Amis & Proches vers paypal.me/poticatfn, note = ton pseudo Discord) ou par **virement SEPA instantané** (IBAN BE15 3632 2722 1530, Jordan Silva, motif = ton pseudo Discord). Ensuite tu envoies ta capture sur le Discord et le staff t'envoie ta clé.",
    quickReplies: ['Je commande où ?', 'Et si ça ne marche pas ?'],
  },
  {
    id: 'refund',
    keywords: ['rembours', 'garantie', 'remboursement', 'annuler', 'rembourser', 'arnaque', 'fiable', 'serieux'],
    answer: () =>
      "Conditions claires : aucun remboursement une fois le travail commencé (sauf si aucune différence constatée après l'optimisation), suivi garanti 30 jours, et fin du support si tu réinitialises ton PC sans nous prévenir. Avant de payer, tu reçois un avis honnête basé sur ton diagnostic UserDiag — on ne te vend rien si ça ne vaut pas le coup pour ta config.",
    quickReplies: ['Voir les résultats', 'Comment vous contacter ?'],
  },
  {
    id: 'results',
    keywords: ['resultat', 'resultats', 'gain', 'gains', 'fps', 'performance', 'efficace', 'ca marche', 'combo', 'combien fps', 'avis', 'note'],
    answer: () =>
      "On ne promet aucun chiffre garanti — c'est notre règle d'honnêteté. Ce qu'on fait : analyse de ton UserDiag et avis du staff sur ce qui bride ton PC et les gains attendus, puis 15 min d'intervention à distance que tu suis en direct. Les avis clients sont visibles sur le Discord, laissés via le bot de review.",
    quickReplies: ['Compatible avec mon PC ?', 'Ça coûte combien ?', 'Et mon ping ?'],
  },
  {
    id: 'ping',
    keywords: ['ping', 'latence reseau', 'packet loss', 'lag reseau', 'connexion', 'wifi', 'ethernet', 'ms'],
    answer: () =>
      "Oui, la partie réseau est incluse dans l'optimisation : connexion stabilisée et pertes de paquets éliminées dans la grande majorité des cas. Comme pour tout le reste, on s'adapte à ta configuration et le support suit ton cas jusqu'à résultat.",
    quickReplies: ['Ça coûte combien ?', 'Compatible avec mon PC ?'],
  },
  {
    id: 'compatibility',
    keywords: ['compatible', 'ma config', 'mon pc', 'marchera', 'fonctionnera', 'configuration', 'config detectee', 'matos', 'hardware', 'portable', 'laptop'],
    answer: (ctx) => {
      let details = ''
      if (ctx?.gpuModel) details += `\n\nD'après ce que j'ai détecté sur ta machine (**${ctx.gpuModel}**`
      else if (ctx?.cpuCores) details += `\n\nD'après ta configuration détectée (**${ctx.cpuCores} threads CPU**`
      if (details) {
        if (ctx?.os && details.includes('**')) details += `, ${ctx.os}`
        if (ctx?.refreshRateHz && details.includes('**')) details += `, écran ${ctx.refreshRateHz}Hz`
        details += ') : oui, c\'est parfaitement compatible. L\'optimisation s\'adapte automatiquement à ton matériel.'
      } else {
        details = "\n\nL'optimisation s'adapte automatiquement à ta configuration détectée par le site."
      }
      return `Oui, FMX fonctionne sur toutes les configurations Windows${details}\n\nLe guide du panel client est personnalisé selon TON matériel exact. Tu peux voir ta config détectée juste au-dessus, et la compléter dans ton espace client après achat.`
    },
    quickReplies: ['Ça coûte combien ?', 'Windows 11 ok ?', 'Je commande où ?'],
  },
  {
    id: 'windows',
    keywords: ['windows', 'win11', 'win10', 'windows 10', 'windows 11', 'systeme', 'os'],
    answer: (ctx) =>
      `FMX est compatible avec **Windows 10 et Windows 11**${ctx?.os ? ` — et je vois que tu es sous ${ctx.os}, donc parfait` : ''}. L'optimisation est adaptée aux spécificités de chaque version.`,
    quickReplies: ['Compatible avec mon PC ?', 'Ça coûte combien ?'],
  },
  {
    id: 'delivery',
    keywords: ['livraison', 'delai', 'rapide', 'instantane', 'quand', 'recevoir', 'acces', 'temps'],
    answer: () =>
      "Une fois ta commande validée, ton accès au panel client est créé et tu reçois tout le nécessaire pour lancer l'optimisation. Le délai exact te sera confirmé au moment du paiement — le support reste dispo si tu as un souci d'accès.",
    quickReplies: ['Je commande où ?', 'Ça coûte combien ?'],
  },
  {
    id: 'how_works',
    keywords: ['comment', 'marche', 'fonctionne', 'methode', 'technique', 'logiciel', 'programme', 'contenu', 'quoi', 'details', 'expliquer', 'concret', 'script'],
    answer: () =>
      "La méthode exacte est confidentielle — on ne détaille pas les réglages, c'est notre savoir-faire. Le déroulé, lui, est transparent : diagnostic UserDiag (5 min), analyse et avis honnête, paiement (20€/25€/50€), intervention 15 min à distance devant ton écran, test en jeu par toi, puis avis via le bot. Ouvre un ticket sur le Discord avec ton rapport UserDiag pour commencer.",
    quickReplies: ['Quels résultats ?', 'Ça coûte combien ?', 'Et si ça ne marche pas ?'],
  },
  {
    id: 'fps_issues',
    keywords: ['chute', 'chutes', 'drop', 'fps bas', 'fps', 'micro freeze', 'micro-freeze', 'stutter', 'saccade', 'freeze', 'lag en jeu', 'rame', 'lent', 'fluidite', 'instable'],
    answer: () =>
      "Les chutes de FPS viennent généralement de processus qui monopolisent tes ressources, d'une mémoire mal gérée ou d'un système encombré. C'est exactement ce que FMX traite — à partir de 20€. Le mieux : fais ton diagnostic UserDiag (5 min) et ouvre un ticket sur le Discord, l'équipe te dira honnêtement ce qui est possible sur ta config.",
    quickReplies: ['Ça coûte combien ?', 'Compatible avec mon PC ?'],
  },
  {
    id: 'order_where',
    keywords: ['commander', 'acheter', 'achete', 'ou commander', 'lien', 'bouton', 'je veux', 'interesse', 'go'],
    answer: () =>
      "Clique sur **« Commander »** dans la section tarifs, choisis ton opti (20€/25€/50€), paie par PayPal ou virement avec ton pseudo Discord en note, puis envoie ta capture sur le Discord. Le staff vérifie et t'envoie ta clé.",
    quickReplies: ['Quels moyens de paiement ?', 'Et si ça ne marche pas ?'],
  },
  {
    id: 'contact',
    keywords: ['contact', 'support', 'aide', 'discord', 'telegram', 'email', 'mail', 'joindre', 'question', 'humain'],
    answer: () =>
      "Ouvre un ticket sur le Discord avec ton rapport UserDiag, ou crée un ticket depuis ton espace client (réponse prioritaire). Le support suit chaque client 30 jours après l'intervention.",
    quickReplies: ['Je commande où ?', 'Voir les résultats'],
  },
  {
    id: 'who',
    keywords: ['qui etes', 'qui est fmx', 'c est quoi fmx', 'fmx', 'entreprise', 'equipe', 'presentation'],
    answer: () =>
      "FMX Optimisation, c'est une équipe de passionnés d'esport spécialisée dans la performance PC gaming : analyse UserDiag + avis staff, intervention 15 min à distance, suivi 30 jours. Offres à 20€, 25€ et 50€ selon le niveau.",
    quickReplies: ['Quels résultats ?', 'Ça coûte combien ?'],
  },
  {
    id: 'thanks',
    keywords: ['merci', 'thanks', 'super', 'parfait', 'genial', 'top', 'nickel', 'cool'],
    answer: () =>
      "Avec plaisir ! Si tu as d'autres questions je suis là. Sinon, rendez-vous dans la section tarifs (20€/25€/50€) pour lancer ton optimisation.",
    quickReplies: ['Je commande où ?', 'Quels résultats ?'],
  },
  {
    id: 'bye',
    keywords: ['bye', 'au revoir', 'a plus', 'salut bye', 'ciao'],
    answer: () => "À bientôt sur FMX Optimisation — bonne chance en jeu !",
  },
]

// Normalise le texte : minuscules, sans accents, sans ponctuation superflue
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ChatReply {
  reply: string
  quickReplies: string[]
  intent: string
}

function getReply(message: string, ctx?: z.infer<typeof chatSchema>['context']): ChatReply {
  const normalized = normalize(message)

  // Score chaque intention : nombre de mots-clés trouvés (pondéré par longueur du mot)
  let best: { intent: Intent; score: number } | null = null

  for (const intent of INTENTS) {
    let score = 0
    for (const kw of intent.keywords) {
      const normKw = normalize(kw)
      if (normalized.includes(normKw)) {
        // Les mots longs sont plus significatifs
        score += normKw.length >= 5 ? 3 : 1
        // Bonus si mot entier (évite "os" dans "chose")
        const regex = new RegExp(`\\b${normKw.replace(/[-\s]/g, '\\s')}\\b`)
        if (regex.test(normalized)) score += 2
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score }
    }
  }

  // Seuil minimum pour considérer l'intention comme identifiée
  const FALLBACK_REPLIES = [
    "Je ne suis pas sûr d'avoir compris. Je peux te renseigner sur : les prix (20€/25€/50€), le déroulé, la compatibilité avec ta config, les conditions ou le paiement.",
    "Hmm, ça n'a pas l'air dans mes cordes ! Essaie plutôt : « ça coûte combien ? », « quels résultats ? », « c'est compatible avec mon PC ? »",
  ]
  const fallbackQuickReplies = ['Ça coûte combien ?', 'Quels résultats ?', 'Compatible avec mon PC ?', 'Chutes de FPS']

  if (!best || best.score < 3) {
    return {
      reply: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)],
      quickReplies: fallbackQuickReplies,
      intent: 'fallback',
    }
  }

  return {
    reply: best.intent.answer(ctx ?? undefined),
    quickReplies: best.intent.quickReplies || fallbackQuickReplies,
    intent: best.intent.id,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = chatSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Message invalide' }, { status: 400 })
    }

    const { message, context } = validation.data
    const result = getReply(message, context)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { reply: "Oups, un souci technique de mon côté. Réessaie dans un instant !", quickReplies: [], intent: 'error' },
      { status: 200 }
    )
  }
}
