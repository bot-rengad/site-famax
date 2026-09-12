'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'

// Layout épuré : une seule barre de titre (plus de doublon),
// pas de sidebar, pas de paramètres superflus. Le parcours fait le reste.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [me, setMe] = useState<{ pseudo: string; avatar: string | null } | null>(null)

  useEffect(() => {
    // Ne déconnecte QUE si le serveur répond explicitement 401 (session expirée).
    fetch('/api/users/me')
      .then(async res => {
        if (res.status === 401) {
          window.location.href = '/auth/login'
          return
        }
        const data = await res.json()
        const u = data?.user
        if (u) {
          setMe({
            pseudo: u.discordGlobalName || u.discordUsername || u.name || u.email.split('@')[0],
            avatar: u.discordAvatar || null,
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-fmx-black">
      {/* Halo rouge d'ambiance */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(60% 45% at 85% -10%, rgba(229,9,20,0.08), transparent 70%), radial-gradient(50% 40% at 0% 110%, rgba(229,9,20,0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Barre unique */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-fmx-black/90">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-3 px-5 lg:px-10">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" aria-label="FMx — Mon parcours">
              <Logo size={30} />
            </Link>
            <Link href="/" className="hidden text-[13px] font-medium text-fmx-gray transition-colors hover:text-white sm:block">
              Accueil du site
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/fmx"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 px-4 py-2 text-[13px] font-bold text-[#8b9bff] transition-colors hover:bg-[#5865F2]/20 sm:inline-flex"
            >
              <MessageCircle className="h-4 w-4" />
              Discord
            </a>
            {me && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-4 transition-colors hover:bg-white/[0.12]"
              >
                {me.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-fmx-red text-[12px] font-extrabold text-white">
                    {me.pseudo.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="max-w-[120px] truncate text-[13px] font-bold text-white">{me.pseudo}</span>
              </Link>
            )}
            <button
              onClick={() => { window.location.href = '/api/auth/logout' }}
              className="rounded-full border border-white/10 p-2.5 text-fmx-gray transition-colors hover:bg-white/[0.06] hover:text-white"
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="relative z-10">
        <div className="mx-auto max-w-[1080px] px-5 py-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
