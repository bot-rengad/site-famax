import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Conditions Générales',
  description: "Conditions générales de vente FMX Optimisation : prestations, tarifs, paiement, remboursement et support.",
}

export default function ConditionsGenerales() {
  return (
    <div className="mx-auto max-w-[860px] px-5 py-28 lg:px-10 lg:pt-36">
      <Breadcrumb current="Conditions Générales" />
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
        Conditions Générales
      </h1>
      <div className="mt-8 grid gap-6 text-[14px] leading-relaxed text-fmx-gray">
        <section className="fmx-window rounded-2xl p-6">
          <h2 className="mb-2 font-bold text-white">1. Prestations & tarifs</h2>
          <p>
            Pack Express 15€, Opti Windows 20€, Pack Undervolt & Overclocking CPU + GPU 20€,
            Pack Complet (Windows + BIOS) 25€, Pack Ultime 50€, paiement unique, sans option.
            Dépannage 5 à 15€ via ticket (diagnostic puis tarif exact selon gravité).
            Déroulé : diagnostic UserDiag, analyse et avis honnête (sans chiffres garantis),
            paiement, intervention 15 min à distance, test en jeu par le client.
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-6">
          <h2 className="mb-2 font-bold text-white">2. Paiement</h2>
          <p>
            PayPal (envoi en Amis & Proches, pseudo Discord en note) ou virement SEPA
            instantané. L’intervention ne démarre qu’après paiement confirmé et preuve
            envoyée sur le Discord.
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-white">3. Remboursement & support</h2>
          <p>
            Aucun remboursement possible une fois le travail commencé, sauf si aucune
            différence n’est constatée après l’optimisation (le staff réévalue alors avec vous :
            optimisation complémentaire ou geste commercial).
            Suivi garanti pendant 30 jours pour résoudre vos problèmes (à vie pour le Pack Ultime).
            Fin immédiate du support si vous réinitialisez votre PC sans nous prévenir.
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-6">
          <h2 className="mb-2 font-bold text-white">4. Responsabilités</h2>
          <p>
            Le client reste présent devant son PC pendant l’intervention. L’éditeur ne
            saurait être tenu responsable d’une perte de données : une sauvegarde
            (point de restauration) est systématiquement créée avant toute modification.
          </p>
        </section>
      </div>
    </div>
  )
}
