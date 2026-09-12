'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const oauthError = searchParams.get('error')

  // Messages d'erreur lisibles pour les retours OAuth Discord
  const oauthErrorMessages: Record<string, string> = {
    discord_not_configured: 'Vérification Discord non configurée sur le serveur (clés API manquantes).',
    discord_denied: 'Autorisation Discord refusée.',
    discord_invalid: 'Requête Discord invalide.',
    discord_state: 'Session de vérification expirée, réessayez.',
    discord_exchange: 'Échec de la communication avec Discord.',
    discord_already_linked: 'Ce compte Discord est déjà lié à un autre compte FMX.',
    discord_server: 'Erreur serveur lors de la vérification Discord.',
  }
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
    if (!formData.password) newErrors.password = 'Mot de passe requis'
    else if (formData.password.length < 8) newErrors.password = 'Min 8 caractères'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur connexion')
      toast.success('Connexion réussie !')
      router.push(redirect)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-30" aria-hidden="true" />
      <div className="absolute inset-0 carbon-overlay" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <Logo size={56} />
          </Link>
          <h1 className="font-display text-display-md text-fmx-white mb-2">Connexion</h1>
          <p className="text-fmx-white-dim">Accédez à votre espace d'optimisation FMX</p>
        </div>

        {/* Erreurs OAuth Discord */}
        {oauthError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">
              {oauthErrorMessages[oauthError] || 'Une erreur est survenue.'}
            </p>
          </div>
        )}

        {/* Login Form */}
        <Card variant="glass" padding="xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              iconLeft={<Mail className="w-5 h-5" />}
              autoComplete="email"
              autoFocus
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                error={errors.password}
                iconLeft={<Lock className="w-5 h-5" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-fmx-gray hover:text-fmx-white transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={e => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="w-4 h-4 rounded border-fmx-border bg-fmx-carbon text-fmx-red focus:ring-fmx-red"
                />
                <span className="text-sm text-fmx-white-dim">Se souvenir de moi</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-fmx-red hover:text-fmx-red/80 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button variant="neon" fullWidth size="lg" loading={loading} className="pt-2">
              <Zap className="w-5 h-5 mr-2" />
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-fmx-border/50 text-center">
            <p className="text-fmx-white-dim text-sm">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-fmx-red hover:text-fmx-red/80 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </Card>

        {/* Connexion / vérification via Discord */}
        <div className="mt-6">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute inset-0 h-px bg-fmx-border/50" />
            <span className="relative bg-fmx-black px-4 text-xs text-fmx-gray uppercase tracking-wider">ou</span>
          </div>
          <a
            href="/api/auth/discord"
            className={cn(
              'w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl font-display font-semibold text-sm transition-all duration-200',
              'bg-[#5865F2] hover:bg-[#4752C4] text-white hover:scale-[1.02] active:scale-[0.98]',
              'shadow-lg shadow-[#5865F2]/25'
            )}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
            </svg>
            Continuer avec Discord
          </a>
          <p className="text-center text-xs text-fmx-gray mt-3">
            Votre nom d'affichage Discord devient votre pseudo FMX
          </p>
        </div>

        {/* Features hint */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Zap, label: 'Optimisation', desc: 'Adaptée à ta config' },
            { icon: Lock, label: 'Sécurisé', desc: 'Connexion chiffrée' },
            { icon: CheckCircle, label: 'Support', desc: 'Inclus avec ta commande' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-3 rounded-xl bg-fmx-carbon/50 border border-fmx-border/50"
            >
              <item.icon className="w-6 h-6 mx-auto mb-2 text-fmx-red" />
              <p className="font-medium text-fmx-white text-sm">{item.label}</p>
              <p className="text-fmx-white-dim text-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Suspense requis : useSearchParams() force un rendu côté client
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-fmx-red border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}