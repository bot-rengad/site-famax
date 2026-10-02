// Types locaux (SQLite ne supporte pas les enums Prisma natifs)
export type UserRole = 'USER' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'STRIPE' | 'PAYPAL' | 'CRYPTO' | 'BANK_TRANSFER' | 'MANUAL'
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'PENDING'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type ScriptCategory = 'SYSTEM_CLEANUP' | 'TIMER_RESOLUTION' | 'POWER_MANAGEMENT' | 'NETWORK_OPTIMIZATION' | 'GPU_OPTIMIZATION' | 'REGISTRY_TWEAKS' | 'DEBLOAT' | 'GAME_SPECIFIC' | 'FULL_AUTOMATION'

export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  emailVerified: Date | null
  // Compte Discord lié (vérification OAuth)
  discordId: string | null
  discordUsername: string | null
  discordGlobalName: string | null
  discordAvatar: string | null
  discordVerifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile | null
}

export interface UserProfile {
  id: string
  userId: string
  cpu: string | null
  gpu: string | null
  ram: string | null
  motherboard: string | null
  storage: string | null
  os: string | null
  favoriteGame: string | null
  monitorRefresh: string | null
  mouseDPI: string | null
  keyboardPolling: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  packageType: string
  amount: number
  currency: string
  status: OrderStatus
  paymentMethod: PaymentMethod | null
  paymentId: string | null
  licenseKey: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  paidAt: Date | null
  completedAt: Date | null
  license?: License | null
}

export interface License {
  id: string
  key: string
  userId: string
  orderId: string | null
  packageType: string
  status: LicenseStatus
  expiresAt: Date | null
  activatedAt: Date | null
  deviceId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  id: string
  userId: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string | null
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
  messages?: TicketMessage[]
  user?: User
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  message: string
  isStaff: boolean
  createdAt: Date
  user?: User
}

export interface OptimizationScript {
  id: string
  name: string
  description: string
  category: ScriptCategory
  content: string
  version: string
  isActive: boolean
  requiresAdmin: boolean
  downloadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ChecklistItem {
  id: string
  category: string
  title: string
  description: string | null
  script: string | null
  order: number
  isRequired: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserChecklistProgress {
  id: string
  userId: string
  checklistItemId: string
  completed: boolean
  completedAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  checklistItem?: ChecklistItem
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export interface SiteSettings {
  id: string
  siteName: string
  siteDescription: string | null
  maintenanceMode: boolean
  registrationOpen: boolean
  defaultPackage: string
  supportEmail: string
  discordUrl: string | null
  telegramUrl: string | null
  createdAt: Date
  updatedAt: Date
}

// Package definitions
export interface Package {
  id: string
  name: string
  description: string
  price: number
  currency: string
  features: string[]
  supportLevel: string
  maxDevices: number
  lifetimeUpdates: boolean
  popular?: boolean
}

// Offres FMx — Tarifs & Prestations FaMaxOpti (5 packs).
// L'Ultime inclut déjà tout : les add-ons ne sont proposés que sur les autres packs.
export type PackId = 'EXPRESS' | 'WINDOWS' | 'UVOC' | 'COMPLET' | 'ULTIME'

export const PACKAGES: Package[] = [
  {
    id: 'EXPRESS',
    name: 'Pack Express',
    description: 'Sans RDV, reçu en ~5 min. Idéal pour un 1er boost rapide.',
    price: 15,
    currency: 'EUR',
    features: [
      'Boost auto 1-clic + mode perf maximale Windows',
      '+FPS, latence réduite, effet Zero Delay souris / clavier',
      'Connexion stabilisée + nettoyage express Fortnite / GPU',
    ],
    supportLevel: 'standard',
    maxDevices: 1,
    lifetimeUpdates: false,
  },
  {
    id: 'WINDOWS',
    name: 'Opti Windows',
    description: 'Optimisation manuelle complète.',
    price: 20,
    currency: 'EUR',
    features: [
      'Nettoyage système + pilote GPU allégé NVIDIA / AMD',
      'Tweaks registre, timer système, priorité jeu',
      'Profil alim sur-mesure',
    ],
    supportLevel: 'standard',
    maxDevices: 1,
    lifetimeUpdates: false,
  },
  {
    id: 'UVOC',
    name: 'Pack Undervolt & OC',
    description: 'Undervolt & overclocking CPU + GPU, en douceur.',
    price: 20,
    currency: 'EUR',
    features: [
      '+FPS, affichage plus stable, températures réduites',
      'Réglages progressifs et testés, zéro risque matériel',
    ],
    supportLevel: 'standard',
    maxDevices: 1,
    lifetimeUpdates: false,
  },
  {
    id: 'COMPLET',
    name: 'Pack Complet',
    description: 'Opti Windows + réglages BIOS : RAM haute vitesse, liaison GPU / CPU débridée, économies d’énergie coupées.',
    price: 25,
    currency: 'EUR',
    features: [
      'Tout le Pack Opti Windows',
      'RAM haute vitesse (profil XMP / EXPO)',
      'Liaison GPU / CPU débridée',
      "Économies d'énergie coupées",
    ],
    supportLevel: 'priority',
    maxDevices: 1,
    lifetimeUpdates: false,
    popular: true,
  },
  {
    id: 'ULTIME',
    name: 'Pack Ultime',
    description: 'Tout inclus : Pack Complet + Windows propre + Undervolt / OC + périphériques + stream + suivi à vie.',
    price: 50,
    currency: 'EUR',
    features: [
      'Tout le Pack Complet (Windows + BIOS)',
      'Windows propre réinstallé',
      'Undervolt / Overclocking CPU + GPU',
      'Périphériques + configuration stream',
      'Suivi à vie',
    ],
    supportLevel: 'priority',
    maxDevices: 1,
    lifetimeUpdates: true,
  },
]

// Anciennes offres (commandes existantes en base) : affichage uniquement, plus en vente.
const LEGACY_PACKS: Record<string, { name: string; price: number }> = {
  BASIC: { name: 'Pack Basic', price: 20 },
  PRO: { name: 'Pack Pro', price: 25 },
  ULTIMATE: { name: 'Pack Ultimate', price: 50 },
}

/** Libellé d'un pack (nouveau ou ancien) : "Pack Complet — 25€". */
export function packLabel(id: string): string {
  const p = PACKAGES.find(x => x.id === id)
  if (p) return `${p.name} — ${p.price}€`
  const legacy = LEGACY_PACKS[id]
  if (legacy) return `${legacy.name} — ${legacy.price}€`
  return id
}

/** Nom court d'un pack (nouveau ou ancien) : "Pack Complet". */
export function packName(id: string): string {
  const p = PACKAGES.find(x => x.id === id)
  if (p) return p.name
  return LEGACY_PACKS[id]?.name ?? id
}

/** Niveau d'accès scripts : 1 = base, 2 = avancé, 3 = tout (alias historiques inclus). */
export const PACK_LEVELS: Record<string, number> = {
  EXPRESS: 1, WINDOWS: 1, BASIC: 1,
  UVOC: 2, COMPLET: 2, PRO: 2,
  ULTIME: 3, ULTIMATE: 3,
}

// Add-ons — dispos sur tous les packs sauf l'Ultime (qui inclut déjà tout).
// Le dépannage (prix variable 5–15€) passe par ticket, pas par la commande.
export interface Addon {
  id: string
  name: string
  price: number
  desc: string
}

export const ADDONS: Addon[] = [
  { id: 'REINSTALL', name: 'Réinstallation Windows', price: 5, desc: 'Windows officiel vierge avant l’intervention.' },
  { id: 'STREAM', name: 'Configuration Stream', price: 7, desc: 'Encodage OBS / TikTok Live sans perte de fluidité.' },
  { id: 'SUIVI_VIE', name: 'Suivi à vie', price: 5, desc: 'Support illimité, réajustements inclus.' },
  { id: 'PERIPH', name: 'Périphériques', price: 5, desc: 'Calibrage souris/clavier, débridage USB.' },
  { id: 'UV_OC', name: 'Undervolt & OC', price: 20, desc: 'Fréquences + tensions réglées, zéro risque matériel.' },
]

export const ADDON_IDS = ADDONS.map(a => a.id)

export function packPrice(id: string): number {
  return PACKAGES.find(p => p.id === id)?.price ?? 0
}

export function addonsPrice(ids: string[]): number {
  return ids.reduce((sum, id) => sum + (ADDONS.find(a => a.id === id)?.price ?? 0), 0)
}



// Checklist categories : déplacées dans src/lib/checklist-categories.ts (contenu client payant)

// AI Assistant responses
export interface AIRecommendation {
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  scriptId?: string
  checklistItemIds?: string[]
}

export interface AIResponse {
  analysis: string
  recommendations: AIRecommendation[]
  quickActions: {
    label: string
    action: 'run_script' | 'open_checklist' | 'open_downloads' | 'create_ticket'
    payload?: Record<string, unknown>
  }[]
}

// Dashboard stats
export interface DashboardStats {
  totalOrders: number
  activeLicenses: number
  checklistCompletion: number
  ticketsOpen: number
  scriptsDownloaded: number
}

// Navigation
export interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: string
  children?: NavItem[]
}
