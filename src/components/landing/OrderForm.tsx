'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Banknote, Landmark as BankBuilding, Loader2, CheckCircle, AlertCircle, X, Zap, Mail } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { PACKAGES, Package } from '@/types'

interface OrderFormProps {
  isOpen: boolean
  onClose: () => void
  selectedPackage: string
}

// Moyens réels : PayPal ou virement uniquement (pas de carte)
const paymentMethods = [
  { id: 'PAYPAL', label: 'PayPal', desc: 'Amis & Proches, pseudo Discord en note', icon: Banknote, color: 'text-blue-500' },
  { id: 'BANK_TRANSFER', label: 'Virement bancaire', desc: 'SEPA instantané, motif = pseudo Discord', icon: BankBuilding, color: 'text-green-400' },
]

export function OrderForm({ isOpen, onClose, selectedPackage }: OrderFormProps) {
  const pkg = PACKAGES.find(p => p.id === selectedPackage) || PACKAGES[0]
  const [step, setStep] = useState<'method' | 'details' | 'success'>('method')
  const [paymentMethod, setPaymentMethod] = useState<string>('PAYPAL')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)

  // La commande = une RÉSERVATION. Le paiement se fait ensuite sur PayPal/RIB
  // avec le pseudo Discord en note, et c'est le staff qui valide après la preuve.
  // Aucune clé n'est générée ici.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const createRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType: selectedPackage, paymentMethod }),
      })

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}))
        if (createRes.status === 401) {
          throw new Error('Connecte-toi avec Discord pour réserver ton opti.')
        }
        throw new Error(data.error || 'Erreur lors de la création de la commande')
      }

      const { order } = await createRes.json()
      setOrderNumber(order.orderNumber)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'details') setStep('method')
  }

  const handleCancel = () => {
    if (step !== 'method') {
      setShowConfirm(true)
    } else {
      onClose()
    }
  }

  const progressSteps = [
    { label: 'Paiement', step: 'method' },
    { label: 'Infos', step: 'details' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="xl"
      title={`Commande - Pack ${pkg.name}`}
      showCloseButton={step === 'method'}
    >
      <AnimatePresence mode="wait">
        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-display font-bold transition-all duration-300',
                    step === s.step || (step === 'success' && i < 3)
                      ? 'bg-fmx-red text-fmx-white'
                      : step === 'details' && i === 0
                      ? 'bg-fmx-red text-fmx-white'
                      : 'bg-fmx-carbon border border-fmx-border text-fmx-gray'
                  )}
                >
                  {step === s.step || (step === 'success' && i < 3) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className={cn('ml-2 font-display text-caption hidden sm:block', step === s.step ? 'text-fmx-red' : 'text-fmx-gray')}>
                  {s.label}
                </span>
                {i < progressSteps.length - 1 && (
                  <div
                    className={cn(
                        'w-20 h-0.5 mx-2',
                        step !== 'method' && i === 0 ? 'bg-fmx-red' : 'bg-fmx-border'
                      )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 'method' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-fmx-white-dim text-center mb-6">Choisissez votre moyen de paiement</p>
            <div className="grid grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSelected = paymentMethod === method.id
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3',
                      'bg-fmx-carbon/50',
                      isSelected
                        ? 'border-fmx-red bg-fmx-red/10 shadow-neon-red-sm'
                        : 'border-fmx-border/50 hover:border-fmx-red/50 hover:bg-fmx-red/5'
                    )}
                  >
                    <Icon className={cn('w-8 h-8', method.color)} aria-hidden="true" />
                    <span className="font-display font-medium text-fmx-white">{method.label}</span>
                    <span className="text-fmx-gray text-xs text-center">{method.desc}</span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-fmx-red flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-fmx-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="neon" size="lg" onClick={() => setStep('details')} className="min-w-[160px]">
                Continuer
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Nom complet"
                placeholder="Jean Dupont"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                iconLeft={<Icon className="w-5 h-5" />}
              />
              <Input
                label="Email"
                type="email"
                placeholder="jean@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                iconLeft={<Mail className="w-5 h-5" />}
              />
            </div>

            {/* Order Summary */}
            <Card variant="bordered" padding="md" className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-medium text-fmx-white">Récapitulatif</span>
                <Badge variant="red">{pkg.name}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-fmx-white-dim">
                  <span>{pkg.name}</span>
                  <span className="text-fmx-white">{pkg.price.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-fmx-white-dim">
                  <span>Frais de dossier</span>
                  <span className="text-green-400">Offerts</span>
                </div>
                <div className="flex justify-between border-t border-fmx-border/50 pt-2 font-display font-medium text-fmx-white">
                  <span>Total</span>
                  <span>{pkg.price.toFixed(2)}€</span>
                </div>
              </div>
            </Card>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-fmx-red">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleBack} className="flex-1">
                <X className="w-4 h-4 mr-1" />
                Retour
              </Button>
              <Button variant="neon" type="submit" loading={loading} className="flex-1">
                {loading ? 'Traitement...' : 'Confirmer la commande'}
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.form>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="text-center py-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="font-display text-heading-xl text-fmx-white mb-2">Commande enregistrée !</h3>
            <p className="text-fmx-white-dim mb-6">
              Réservation <span className="font-mono text-fmx-white">{orderNumber}</span> — {pkg.name} ({pkg.price.toFixed(2)}€).
              <br />
              Il reste 3 étapes, tout se passe sur Discord :
            </p>

            <Card variant="bordered" padding="md" className="mb-6 text-left">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#5865F2]/15 text-[13px] font-extrabold text-[#8b9bff]">1</span>
                  <span className="text-fmx-white-dim"><b className="text-white">Vérifie ton Discord</b> avec le bouton Login Discord si ce n&apos;est pas fait.</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fmx-red/15 text-[13px] font-extrabold text-fmx-red">2</span>
                  <span className="text-fmx-white-dim"><b className="text-white">Paie {pkg.price.toFixed(2)}€</b> via {paymentMethod === 'PAYPAL' ? 'PayPal (Amis & Proches)' : 'virement SEPA'} avec ton <b className="text-white">pseudo Discord en note</b>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fmx-red/15 text-[13px] font-extrabold text-fmx-red">3</span>
                  <span className="text-fmx-white-dim"><b className="text-white">Envoie ta preuve</b> (capture) sur le Discord, puis ouvre un ticket avec ton rapport UserDiag.</span>
                </li>
              </ol>
            </Card>

            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://discord.gg/fmx" target="_blank" rel="noreferrer">
                <Button variant="neon" size="lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Ouvrir le Discord
                </Button>
              </a>
              <Button variant="ghost" size="lg" onClick={() => { onClose(); window.location.href = '/dashboard'; }}>
                Voir ma commande
              </Button>
            </div>
          </motion.div>
        )}

        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={onClose}
          title="Annuler la commande ?"
          message="Votre progression sera perdue. �Stes-vous sûr de vouloir quitter ?"
          confirmText="Quitter"
          variant="danger"
        />
      </AnimatePresence>
    </Modal>
  )
}

// Icon component for Input
function Icon({ children, ...props }: React.SVGAttributes<SVGElement>) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">{children}</svg>
}
