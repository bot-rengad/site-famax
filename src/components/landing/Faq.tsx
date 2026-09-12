'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

// FAQ réelle — réponses tirées du déroulé et des tarifs FaMaxOpti, rien d'inventé.
const faqs = [
  {
    q: 'Comment se passe une optimisation ?',
    a: "Tu fais ton diagnostic UserDiag (5 min), l'équipe analyse ton rapport et te donne un avis honnête, tu paies, puis intervention de 30 à 45 minutes à distance devant ton écran. Tu testes en jeu, puis tu laisses un avis via le bot du serveur.",
  },
  {
    q: 'Combien ça coûte ?',
    a: 'Pack Basic 20€, Pack Complet (Basic + BIOS) 25€, Pack Ultime 50€. Paiement unique, effet permanent. Options : réinstallation Windows +5€, stream +7€, suivi à vie +5€, périphériques +5€, undervolt & OC +20€, dépannage 5 à 15€.',
  },
  {
    q: 'Comment je paie ?',
    a: 'Par PayPal (envoi en Amis & Proches vers paypal.me/poticatfn) ou par virement SEPA instantané (IBAN BE15 3632 2722 1530, Jordan Silva). Dans les deux cas : montant exact + ton pseudo Discord en note, puis capture envoyée sur le Discord.',
  },
  {
    q: 'Et si ça ne change rien sur mon PC ?',
    a: "C'est pour ça qu'il y a un avis honnête AVANT le paiement : si ton PC n'y gagnera rien, on te le dit. Après l'intervention, suivi garanti 30 jours. Aucun remboursement une fois le travail commencé, sauf si aucune différence constatée.",
  },
  {
    q: 'C’est sans risque pour mon PC ?',
    a: "L'intervention commence toujours par une sauvegarde (point de restauration), suit un protocole strict dans un ordre précis, et tu suis tout en direct. Modifications progressives et testées. Le support s'arrête seulement si tu réinitialises ton PC sans prévenir.",
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 py-16 lg:px-10">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
          Questions fréquentes
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-fmx-gray">
          Le reste se demande directement sur Discord.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-[860px] gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="fmx-window overflow-hidden rounded-2xl">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-[14px] font-bold text-white">{f.q}</span>
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] transition-transform duration-200',
                    isOpen && 'rotate-45 border-fmx-red/40 bg-fmx-red/15'
                  )}
                >
                  <Plus className="h-4 w-4 text-fmx-red" />
                </span>
              </button>
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-200 ease-out',
                  isOpen ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-[13px] leading-relaxed text-fmx-gray">{f.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
