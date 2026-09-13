'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Logo } from '@/components/ui/Logo'

const navLinks = [
  { href: '/#plans', label: 'Plans', section: 'plans' },
  { href: '/#config', label: 'Estimateur FPS', section: 'config' },
  { href: '/#deroulement', label: 'Déroulé', section: 'deroulement' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [me, setMe] = useState<{ pseudo: string; avatar: string | null; role: string } | null>(null)
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Section active (scrollspy) — uniquement sur la page d'accueil
  useEffect(() => {
    const ids = navLinks.map(l => l.section)
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Ferme le menu mobile au redimensionnement vers desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Utilisateur connecté : pseudo + avatar Discord en haut à droite
  // + lien direct vers sa dernière commande en cours
  useEffect(() => {
    fetch('/api/users/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const u = data?.user
        if (u) {
          setMe({
            pseudo: u.discordGlobalName || u.discordUsername || u.name || u.email.split('@')[0],
            avatar: u.discordAvatar || null,
            role: u.role || 'USER',
          })
          fetch('/api/orders?limit=1')
            .then(r => (r.ok ? r.json() : null))
            .then(d => {
              const first = d?.orders?.[0]
              if (first) setLatestOrderId(first.id)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] backdrop-blur-xl transition-colors duration-300',
        scrolled ? 'bg-[#060608]/95 shadow-[0_8px_32px_rgba(0,0,0,0.45)]' : 'bg-[#060608]/80'
      )}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3.5 lg:px-10">
        <Link href="/" aria-label="FMx — Accueil">
          <Logo size={30} />
        </Link>

        {/* Liens desktop — survol souris : soulignement animé + halo */}
        <div className="hidden items-center gap-8 text-[13px] font-medium text-fmx-gray lg:flex">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              aria-current={active === link.section ? 'true' : undefined}
              className={cn(
                'group relative py-1.5 transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,26,26,0.45)]',
                active === link.section && 'font-bold text-white'
              )}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-fmx-red shadow-[0_0_12px_rgba(255,26,26,0.8)] transition-transform duration-200',
                  active === link.section ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )}
              />
            </a>
          ))}
          {me && (
            <a href={latestOrderId ? `/dashboard/orders/${latestOrderId}` : '/dashboard/order'} className="group relative py-1.5 font-bold text-fmx-red transition-all duration-200 hover:-translate-y-px hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,26,26,0.6)]">
              Ma commande
              <span aria-hidden="true" className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-white transition-transform duration-200 group-hover:scale-x-100" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          {me?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="hidden items-center gap-2 rounded-full border border-fmx-red/40 bg-fmx-red/10 px-4 py-2 text-[13px] font-bold text-fmx-red transition-colors hover:bg-fmx-red/20 md:inline-flex"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
          {me ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-4 transition-colors hover:bg-white/[0.12]"
              aria-label="Mon espace"
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
          ) : (
            <>
              <a
                href="/api/auth/discord"
                className="hidden min-[480px]:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.12]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.73 4.87a18.2 18.2 0 0 0-4.5-1.42c-.22.4-.42.83-.6 1.27a16.13 16.13 0 0 0-4.56 0c-.18-.44-.38-.87-.6-1.27a18.18 18.18 0 0 0-4.5 1.42C2.53 9.1 1.67 13.2 1.89 17.27a18.43 18.43 0 0 0 5.52 2.78c.44-.6.83-1.23 1.14-1.9a12.4 12.4 0 0 1-1.8-.86c.15-.11.3-.22.44-.35a12.9 12.9 0 0 0 6.6 0c.14.13.29.24.44.35a12.4 12.4 0 0 1-1.8.86c.31.67.7 1.3 1.14 1.9a18.43 18.43 0 0 0 5.52-2.78c.37-4.74-1.02-8.84-1.35-10.4ZM9.39 14.55c-1.02 0-1.86-.94-1.86-2.09 0-1.15.82-2.09 1.86-2.09 1.03 0 1.87.94 1.87 2.09 0 1.15-.84 2.09-1.87 2.09Zm5.16 0c-1.02 0-1.86-.94-1.86-2.09 0-1.15.82-2.09 1.86-2.09 1.03 0 1.87.94 1.87 2.09 0 1.15-.84 2.09-1.87 2.09Z" />
                </svg>
                Login Discord
              </a>
            </>
          )}
          <a
            href="/dashboard/order"
            className="rounded-full bg-fmx-red px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(255,26,26,0.35)] transition-transform duration-200 hover:-translate-y-px sm:px-5"
          >
            Commander →
          </a>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="rounded-lg border border-white/10 p-2 text-white lg:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-white/[0.08] bg-[#060608]/95 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-fmx-gray transition-all duration-150 hover:translate-x-1 hover:bg-white/5 hover:text-white hover:shadow-[0_0_16px_rgba(255,26,26,0.15)]"
              >
                {link.label}
              </a>
            ))}
            {me?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-fmx-red/10 px-3 py-3 text-sm font-bold text-fmx-red hover:bg-fmx-red/20"
              >
                <ShieldCheck className="h-4 w-4" />
                Panel Admin
              </Link>
            )}
            {me ? (
              <a
                href={latestOrderId ? `/dashboard/orders/${latestOrderId}` : '/dashboard/order'}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-fmx-red/10 px-3 py-3 text-sm font-bold text-fmx-red hover:bg-fmx-red/20"
              >
                Ma commande →
              </a>
            ) : (
              <a
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-fmx-gray hover:bg-white/5 hover:text-white"
              >
                Espace client
              </a>
            )}
            {!me && (
              <a
                href="/api/auth/discord"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-[#5865F2] px-3 py-3 text-center text-sm font-bold text-white min-[480px]:hidden"
              >
                Login Discord
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
