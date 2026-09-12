'use client'

// Barre CTA sticky bas d'écran — mobile uniquement (< md).
// La modale de commande (z-50+) passe par-dessus quand elle est ouverte.
export function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#060608]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
      <a
        href="/dashboard/order?pack=COMPLET"
        className="block rounded-full bg-fmx-red py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,26,26,0.4)] transition-transform active:scale-[0.98]"
      >
        Commander une opti — dès 20€
      </a>
      <p className="mt-1.5 text-center text-[11px] text-fmx-gray">
        Discord requis • Clé envoyée après preuve
      </p>
    </div>
  )
}
