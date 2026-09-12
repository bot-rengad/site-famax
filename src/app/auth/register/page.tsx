'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Nom requis'
    else if (formData.name.trim().length < 2) newErrors.name = 'Min 2 caractères'
    if (!formData.email) newErrors.email = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
    if (!formData.password) newErrors.password = 'Mot de passe requis'
    else if (formData.password.length < 8) newErrors.password = 'Min 8 caractères'
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Au moins 1 majuscule'
    else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Au moins 1 minuscule'
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Au moins 1 chiffre'
    else if (!/[^A-Za-z0-9]/.test(formData.password)) newErrors.password = 'Au moins 1 caractère spécial'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur inscription')
      toast.success('Inscription réussie ! Bienvenue sur FMX Optimisation.')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur d\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  const strengthColors = ['text-fmx-red', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-green-400']

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
          <h1 className="font-display text-display-md text-fmx-white mb-2">Créer un compte</h1>
          <p className="text-fmx-white-dim">Rejoignez la communauté FMX Optimisation</p>
        </div>

        {/* Register Form */}
        <Card variant="glass" padding="xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom complet"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              iconLeft={<User className="w-5 h-5" />}
              autoComplete="name"
              autoFocus
            />

            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value.toLowerCase() }))}
              error={errors.email}
              iconLeft={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => {
                  setFormData(prev => ({ ...prev, password: e.target.value }))
                  checkPasswordStrength(e.target.value)
                }}
                error={errors.password}
                iconLeft={<Lock className="w-5 h-5" />}
                autoComplete="new-password"
                hint="Min 8 caractères, majuscule, minuscule, chiffre, spécial"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-fmx-gray hover:text-fmx-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-1">
                <div className="h-1.5 bg-fmx-border rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full transition-all duration-300', strengthColors[passwordStrength - 1] || 'text-fmx-gray')}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <p className={cn('text-xs', strengthColors[passwordStrength - 1] || 'text-fmx-gray')}>
                  Force: {strengthLabels[passwordStrength - 1] || 'Très faible'}
                </p>
              </div>
            )}

            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
                iconLeft={<Lock className="w-5 h-5" />}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-fmx-gray hover:text-fmx-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-1 rounded border-fmx-border bg-fmx-carbon text-fmx-red focus:ring-fmx-red"
              />
              <label htmlFor="terms" className="text-sm text-fmx-white-dim">
                J'accepte les <Link href="/terms" className="text-fmx-red hover:underline">CGU</Link> et la <Link href="/privacy" className="text-fmx-red hover:underline">Politique de confidentialité</Link>
              </label>
            </div>

            <Button variant="neon" fullWidth size="lg" loading={loading} className="pt-2">
              <Zap className="w-5 h-5 mr-2" />
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-fmx-border/50 text-center">
            <p className="text-fmx-white-dim text-sm">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-fmx-red hover:text-fmx-red/80 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </Card>

        {/* Inscription / vérification via Discord (recommandé) */}
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
            S'inscrire avec Discord
          </a>
          <p className="text-center text-xs text-fmx-gray mt-3">
            Recommandé : votre nom d'affichage Discord devient automatiquement votre pseudo FMX
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Shield, label: 'Sécurisé', desc: 'Données chiffrées' },
            { icon: Zap, label: 'Accompagné', desc: 'Support inclus' },
            { icon: CheckCircle, label: 'Vérifié', desc: 'Via Discord' },
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