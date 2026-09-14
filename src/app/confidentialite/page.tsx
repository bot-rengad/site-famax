import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité FMX Optimisation conforme RGPD : données collectées, cookies, droits et contact.',
}

export default function Confidentialite() {
  return (
    <div className="mx-auto max-w-[860px] px-5 py-28 lg:px-10 lg:pt-36">
      <Breadcrumb current="Politique de Confidentialité" />
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-white">
        Politique de Confidentialité
      </h1>
      <div className="mt-8 grid gap-6 text-[14px] leading-relaxed text-fmx-gray">
        <section className="fmx-window rounded-2xl p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-white">1. Données collectées</h2>
          <p>
            Compte créé via Discord uniquement (pas de mot de passe FMX) : pseudo,
            identifiant et avatar Discord. Commandes : pack, montant, moyen de paiement,
            statut. Les rapports UserDiag échangés servent uniquement au diagnostic.
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-white">2. Cookies</h2>
          <p>
            Strict nécessaire uniquement : session de connexion et mémorisation du choix
            cookies. Aucun traceur publicitaire ni mesure d’audience activée aujourd’hui.
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-white">3. Vos droits (RGPD)</h2>
          <p>
            Accès, rectification, suppression et export de vos données sur simple demande
            via le serveur Discord <a href="https://discord.gg/fmx" target="_blank" rel="noreferrer" className="text-fmx-red hover:underline">discord.gg/fmx</a>.
            Suppression du compte possible à tout moment sur demande au staff.
          </p>
        </section>
        <section className="fmx-window rounded-2xl p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-white">4. Sécurité</h2>
          <p>
            Sessions en cookies HttpOnly, limitation du nombre de
            requêtes sur l’authentification et les formulaires. Aucune donnée bancaire n’est
            stockée (paiements via PayPal / virement).
          </p>
        </section>
      </div>
    </div>
  )
}
