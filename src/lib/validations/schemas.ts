import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

// Changement de mot de passe (utilisateur connecté)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial'),
})

// Profile schemas
export const profileSchema = z.object({
  cpu: z.string().optional(),
  gpu: z.string().optional(),
  ram: z.string().optional(),
  motherboard: z.string().optional(),
  storage: z.string().optional(),
  os: z.string().optional(),
  favoriteGame: z.string().optional(),
  monitorRefresh: z.string().optional(),
  mouseDPI: z.string().optional(),
  keyboardPolling: z.string().optional(),
  // Champs remplis par la détection automatique du navigateur
  cpuCores: z.number().int().min(1).max(512).nullable().optional(),
  gpuRenderer: z.string().max(500).nullable().optional(),
  autoDetected: z.boolean().optional(),
})

// Mise à jour du compte : profil hardware + nom optionnel
export const userUpdateSchema = profileSchema.extend({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50).optional(),
})

// Order schemas — 3 offres réelles : Basic / Complet / Ultime
// Seuls les moyens affichés dans l'UI sont acceptés (PayPal, virement).
// Aucune auto-validation : le staff valide après la preuve Discord.
// Les add-ons sont validés côté serveur (liste fermée, prix recalculés).
export const orderSchema = z.object({
  packageType: z.enum(['BASIC', 'COMPLET', 'ULTIME']),
  paymentMethod: z.enum(['PAYPAL', 'BANK_TRANSFER']),
  addons: z.array(z.enum(['REINSTALL', 'STREAM', 'SUIVI_VIE', 'PERIPH', 'UV_OC'])).max(5).default([]),
})

// Ticket schemas
export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères').max(100),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères').max(5000),
  category: z.enum(['TECHNICAL', 'BILLING', 'LICENSE', 'GENERAL', 'FEATURE_REQUEST']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
})

export const ticketMessageSchema = z.object({
  message: z.string().min(1, 'Le message ne peut pas être vide').max(5000),
})

// Checklist progress schema
export const checklistProgressSchema = z.object({
  checklistItemId: z.string(),
  completed: z.boolean(),
  notes: z.string().optional(),
})

// AI Assistant schema
export const aiQuerySchema = z.object({
  query: z.string().min(3, 'La requête doit contenir au moins 3 caractères').max(1000),
  context: z.object({
    cpu: z.string().optional(),
    gpu: z.string().optional(),
    ram: z.string().optional(),
    os: z.string().optional(),
    game: z.string().optional(),
  }).optional(),
})

// Scripts (admin) : contenu stocké puis téléchargé par les clients —
// validation stricte anti stored-XSS / DoS par volume.
export const scriptSchema = z.object({
  name: z.string().min(3, 'Nom trop court').max(100),
  description: z.string().min(3, 'Description trop courte').max(2000),
  category: z.string().min(2).max(80),
  content: z.string().min(1, 'Contenu vide').max(200_000, 'Script trop volumineux (200 Ko max)'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version au format X.Y.Z').optional().default('1.0.0'),
  requiresAdmin: z.boolean().optional().default(false),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>
export type ChecklistProgressInput = z.infer<typeof checklistProgressSchema>
export type AIQueryInput = z.infer<typeof aiQuerySchema>
export type ScriptInput = z.infer<typeof scriptSchema>