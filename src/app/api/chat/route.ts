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
    quickReplies: ['Ça coûte combien ?', 'Conseil pour ma config ?', 'Chutes de FPS', 'C’est quoi UserDiag ?'],
  },
  {
    id: 'price',
    keywords: ['prix', 'coute', 'cout', 'tarif', 'c est combien', 'euro', 'eur', 'payement', 'paiement', 'cher', 'abonnement', 'gratuit', 'essai'],
    answer: () =>
      "Nos tarifs : **Pack Basic 20€, Pack Complet 25€, Pack Ultime 50€ — paiement unique**, pas d'abonnement. Options possibles (stream +7€, périphs +5€, UV/OC +20€...). Tu paies par **PayPal** ou **virement** (pseudo Discord en note), puis tu envoies ta preuve sur Discord.",
    quickReplies: ['Quels moyens de paiement ?', 'Il y a un remboursement ?', 'Je commande où ?'],
  },
  {
    id: 'payment',
    keywords: ['paypal', 'carte', 'visa', 'mastercard', 'virement', 'rib', 'iban', 'moyens de paiement', 'payer', 'preuve', 'capture', 'screenshot'],
    answer: () =>
      "Tu paies par **PayPal** (Amis & Proches vers paypal.me/poticatfn, note = ton pseudo Discord) ou **virement SEPA instantané** (IBAN BE15 3632 2722 1530, Jordan Silva, motif = ton pseudo Discord). Ensuite tu envoies la capture sur le Discord et le staff t'envoie ta clé.",
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
    keywords: ['ping', 'latence reseau', 'packet loss', 'lag reseau', 'connexion', 'ms'],
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
    keywords: ['livraison', 'delai', 'rapide', 'instantane', 'quand', 'recevoir', 'acces', 'combien de temps', 'duree', 'dure ', 'creneau', 'rendez vous', 'disponible', 'attente'],
    answer: () =>
      "C'est rapide : diagnostic UserDiag 5 min, intervention 15 min à distance avec toi devant ton écran. Une fois ta commande validée, le staff te cale un créneau sur Discord — demande les dispos dans ton ticket.",
    quickReplies: ['Je commande où ?', 'C’est quoi UserDiag ?'],
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
  // ---------- HARDWARE ----------
  {
    id: 'cpu',
    keywords: ['cpu', 'processeur', 'ryzen', 'intel', 'core i', 'coeurs', 'threads', 'x3d'],
    answer: () =>
      "En jeu compétitif, c'est souvent le CPU qui limite les FPS (les X3D comme le 7800X3D excellent là-dessus). Donne-moi ton modèle ou teste l'estimateur FPS du site — et pour un avis précis sur ta config, envoie ton UserDiag sur le Discord.",
    quickReplies: ['Bottleneck ?', 'Conseil upgrade ?', 'C’est quoi UserDiag ?'],
  },
  {
    id: 'gpu',
    keywords: ['gpu', 'carte graphique', 'rtx', 'gtx', 'radeon', 'vram', 'pilote', 'driver', 'nvidia'],
    answer: () =>
      "Les bases : pilotes à jour, et écran branché sur la carte graphique (pas sur la carte mère, erreur classique !). Pour voir ce que vaut ton GPU selon ton jeu, teste l'estimateur FPS — l'opti s'occupe du reste à partir de 20€.",
    quickReplies: ['Chutes de FPS ?', 'Bottleneck ?', 'Compatible avec mon PC ?'],
  },
  {
    id: 'ram',
    keywords: ['ram', 'memoire', 'ddr', 'xmp', 'expo', 'dual channel', '8 go', '16 go', '32 go', '8go', '16go', '32go', 'barrette'],
    answer: () =>
      "16 Go c'est le minimum pour jouer tranquille (avec 8 Go, les stutters sont quasi garantis), idéalement en 2 barrettes. Le profil haute vitesse de la RAM, c'est justement inclus dans le Pack Complet (25€).",
    quickReplies: ['Voir les prix', 'Chutes de FPS ?', 'Bottleneck ?'],
  },
  {
    id: 'storage',
    keywords: ['ssd', 'hdd', 'disque dur', 'nvme', 'stockage', 'espace disque', 'chargement', 'loading'],
    answer: () =>
      "Installe tes jeux sur SSD (NVMe idéalement) et garde ~20% d'espace libre : un disque plein ou un vieux HDD rallonge les chargements et peut faire saccader. Si ton jeu est encore sur HDD, déplace-le en priorité.",
    quickReplies: ['Chutes de FPS ?', 'Conseil upgrade ?'],
  },
  {
    id: 'temps',
    keywords: ['chauffe', 'pc chauffe', 'chauffe beaucoup', 'temperature', 'degres', 'surchauffe', 'ventilo', 'ventilateur', 'refroidissement', 'pate thermique', 'bruit pc', 'throttle'],
    answer: () =>
      "Un composant qui chauffe trop se bride tout seul pour se protéger — d'où des FPS instables. Dépoussière, vérifie le flux d'air et surveille les températures en jeu. Si ça persiste, le staff analyse ça avec ton UserDiag sur Discord.",
    quickReplies: ['Chutes de FPS ?', 'Contacter le support ?', 'C’est quoi UserDiag ?'],
  },
  {
    id: 'inputlag',
    keywords: ['input lag', 'latence souris', 'delai', 'retard souris', 'tearing', 'vsync', 'gsync', 'freesync', '144hz', '165hz', '240hz', '360hz', '60hz', 'frequence ecran', 'dalle'],
    answer: () =>
      "Vérifie d'abord que ton écran tourne à sa fréquence max dans les paramètres Windows (souvent bloqué à 60 Hz par défaut !). Pour la réactivité et la fluidité globale, c'est le cœur de l'opti — à partir de 20€.",
    quickReplies: ['Chutes de FPS ?', 'Ça coûte combien ?'],
  },
  {
    id: 'crash',
    keywords: ['crash', 'bsod', 'ecran bleu', 'blue screen', 'redemarre tout seul', 'reboot tout seul', 'plante', 'freeze complet'],
    answer: () =>
      "Les crashs à répétition, ça ne se devine pas : fais ton UserDiag et ouvre un ticket sur le Discord en décrivant exactement le problème (quand, quel jeu, message d'erreur). Le staff diagnostique avant tout paiement.",
    quickReplies: ['C’est quoi UserDiag ?', 'Contacter le support ?'],
  },
  {
    id: 'network_wifi',
    keywords: ['wifi', 'ethernet', 'cable', 'fibre', 'box internet', 'debit', 'deco ', 'deconnexion'],
    answer: () =>
      "En compétitif, joue en câble Ethernet, jamais en WiFi — ça règle la majorité des instabilités réseau. La stabilisation et les pertes de paquets, c'est inclus dans l'opti.",
    quickReplies: ['Et mon ping ?', 'Ça coûte combien ?'],
  },
  {
    id: 'bottleneck',
    keywords: ['bottleneck', 'goulot', 'bride', 'limite par', 'cpu limited', 'gpu limited', 'composant limite', 'desiquilibre', 'desequilibre'],
    answer: () =>
      "Le bottleneck, c'est le composant qui freine les autres. Bonne nouvelle : l'estimateur FPS du site l'affiche pour TA config (CPU, GPU ou Équilibré) selon le jeu et la résolution. Teste-le !",
    quickReplies: ['Conseil upgrade ?', 'Tester ma config ?', 'C’est quoi UserDiag ?'],
  },
  {
    id: 'upgrade',
    keywords: ['upgrade', 'upgrader', 'ameliorer', 'changer de composant', 'conseil', 'quel composant', 'nouveau pc', 'nouvelle config', 'vaut le coup'],
    answer: () =>
      "Avant d'acheter quoi que ce soit : estimateur FPS du site + diagnostic UserDiag (5 min, gratuit). Le staff te dit honnêtement si un upgrade vaut le coup ou si une opti à 20-25€ suffit — on ne vend jamais une opti inutile.",
    quickReplies: ['Bottleneck ?', 'C’est quoi UserDiag ?', 'Voir les prix'],
  },
  {
    id: 'periph',
    keywords: ['souris', 'dpi', 'clavier', 'polling', 'sensibilite', 'visee'],
    answer: () =>
      "Calibrage souris/clavier et périphériques : option +5€ (incluse dans le Pack Ultime). En attendant, vérifie déjà ton DPI et la fréquence de ton écran dans les paramètres Windows.",
    quickReplies: ['Voir les prix', 'Latence souris ?'],
  },
  {
    id: 'software_conflict',
    keywords: ['antivirus', 'mcafee', 'norton', 'avast', 'ralentit', 'ralenti', 'programme en fond', 'demarrage', 'startup', 'overlay', 'xbox game bar', 'game bar', 'discord ouvert'],
    answer: () =>
      "Ferme tout ce qui tourne pour rien en jeu (lanceur, navigateur avec 40 onglets, overlays) et vérifie ce qui se lance au démarrage de Windows. L'épuration complète du système, c'est la base de l'opti — à partir de 20€.",
    quickReplies: ['Chutes de FPS ?', 'Ça coûte combien ?'],
  },
  // ---------- OPTI FMX ----------
  {
    id: 'userdiag',
    keywords: ['userdiag', 'user diag', 'diagnostic', 'rapport', 'analyse de mon pc', 'scanner mon pc'],
    answer: () =>
      "**UserDiag**, c'est l'outil de diagnostic gratuit (5 min) : il scanne CPU, GPU, RAM, températures et pilotes. Télécharge-le sur userdiag.com/download, lance le scan et envoie le rapport dans un ticket Discord — le staff te fait un retour honnête.",
    quickReplies: ['Contacter le support ?', 'Ça coûte combien ?'],
  },
  {
    id: 'bios',
    keywords: ['bios', 'carte mere', 'motherboard', 'uefi', 'mise a jour bios', 'secure boot', 'tpm'],
    answer: () =>
      "Le BIOS, on n'y touche pas au hasard : c'est le staff qui s'en charge dans le Pack Complet (25€) — profil RAM haute vitesse, débridage liaison GPU/CPU, coupure des économies d'énergie, en direct avec toi.",
    quickReplies: ['Voir les prix', 'C’est risqué ?'],
  },
  {
    id: 'overclock',
    keywords: ['overclock', 'overclocking', 'undervolt', 'undervolting', ' oc', ' uv'],
    answer: () =>
      "Undervolt & overclocking : plus de perfs pour moins de chauffe, mais mal fait, ça plante. C'est pour ça que c'est le staff qui le fait, dans le Pack Ultime (50€) — avec suivi à vie.",
    quickReplies: ['Voir les prix', 'C’est risqué ?'],
  },
  {
    id: 'safety',
    keywords: ['risque', 'dangereux', 'peur', 'casser', 'sans danger', 'fiable a 100', 'abimer'],
    answer: () =>
      "Zéro bidouille aveugle : sauvegarde avant de commencer, protocole strict dans un ordre précis, et tu vois tout en direct. Et si aucune différence n'est constatée après l'intervention, tu es remboursé.",
    quickReplies: ['Comment ça se passe ?', 'Voir les résultats'],
  },
  {
    id: 'stream',
    keywords: ['stream', 'streamer', 'obs', 'twitch', 'tiktok live', 'enregistrement', 'enregistrer', 'clip'],
    answer: () =>
      "Streamer sans perdre de FPS, ça se règle : option Configuration Stream +7€ avec n'importe quel pack. Précise-le au staff dans ton ticket.",
    quickReplies: ['Voir les prix', 'Je commande où ?'],
  },
  {
    id: 'laptop',
    keywords: ['portable', 'laptop', 'pc portable', 'notebook'],
    answer: () =>
      "Oui, les PC portables sont acceptés — avec des attentes réalistes : ils chauffent plus et se brident plus vite. L'avis honnête du staff te dira ce qui est possible sur le tien, avant de payer.",
    quickReplies: ['C’est quoi UserDiag ?', 'Ça coûte combien ?'],
  },
  {
    id: 'games',
    keywords: ['fortnite', 'valorant', 'valo', 'counter strike', 'cs2', 'warzone', 'call of duty', 'apex', 'rocket league', 'league of legends', 'minecraft', 'gta', 'rust', 'overwatch'],
    answer: () =>
      "L'opti s'adapte à ton jeu — les réglages ne sont pas les mêmes entre Fortnite, Valorant ou Warzone. L'estimateur du site couvre 6 jeux, et pendant l'intervention le staff règle aussi ton jeu en direct.",
    quickReplies: ['Tester ma config ?', 'Je commande où ?'],
  },
  {
    id: 'console_os',
    keywords: ['mac', 'macbook', 'linux', 'ps5', 'ps4', 'xbox', 'switch', 'console', 'playstation', 'telephone', 'mobile'],
    answer: () =>
      "FMX, c'est uniquement PC Windows 10/11 — pas de console, Mac ou Linux. Si tu as un PC Windows, même modeste, l'avis du staff te dira honnêtement ce qui est possible.",
    quickReplies: ['Compatible avec mon PC ?', 'Ça coûte combien ?'],
  },
  {
    id: 'requirements',
    keywords: ['faut quoi', 'besoin de quoi', 'prerequis', 'preparer', 'avant de commander', 'anydesk', 'teamviewer', 'prise en main'],
    answer: () =>
      "Il te faut : un PC Windows, Discord, ton rapport UserDiag et ~20 min devant ton écran. La prise en main à distance se fait avec ton accord, et tu vois tout en direct.",
    quickReplies: ['Je commande où ?', 'C’est quoi UserDiag ?'],
  },
  {
    id: 'aftercare',
    keywords: ['apres', 'suivi', 'reinstallation', 'reinitialiser', 'reset pc', 'formatage', 'depuis l opti'],
    answer: () =>
      "Après l'opti : tu testes en jeu, tu laisses ton avis via le bot, et tu as 30 jours de suivi si un truc cloche. Seule règle : ne réinitialise pas ton PC sans prévenir, sinon le support s'arrête.",
    quickReplies: ['Et si ça ne marche pas ?', 'Voir les résultats'],
  },
  {
    id: 'reviews',
    keywords: ['review', 'les avis', 'temoignage', 'etoile', 'bot de review', 'faux avis'],
    answer: () =>
      "Tous les avis sont laissés via le bot de review du serveur Discord, avec la config du client — 100% vérifiables, zéro faux témoignage. Rejoins le Discord pour les lire.",
    quickReplies: ['Je commande où ?', 'Ça coûte combien ?'],
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
    keywords: ['contact', 'support', 'aide', 'discord', 'telegram', 'email', 'mail', 'joindre', 'question', 'humain', 'ticket', 'ouvrir un ticket', 'creer un ticket', 'serveur', 'rejoindre', 'invite'],
    answer: () =>
      "Rejoins le Discord (discord.gg/fmx) et ouvre un ticket avec ton rapport UserDiag — réponse du staff, suivi 30 jours après l'intervention. Tu peux aussi discuter de ta commande depuis ton espace client.",
    quickReplies: ['Je commande où ?', 'C’est quoi UserDiag ?'],
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
    "Je ne suis pas sûr d'avoir compris. Je peux te renseigner sur : les prix, le déroulé, ton matos (CPU, GPU, RAM, températures...), tes soucis (FPS, ping, crashs) ou la commande.",
    "Hmm, reformule ou choisis un sujet : prix, config, performances, UserDiag, commande...",
  ]
  const fallbackQuickReplies = ['Ça coûte combien ?', 'Conseil pour ma config ?', 'Chutes de FPS', 'C’est quoi UserDiag ?']

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
