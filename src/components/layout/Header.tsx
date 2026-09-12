'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Logo } from '@/components/ui/Logo'

const navLinks = [
  { href: '#plans', label: 'Plans' },
  { href: '#config', label: 'Estimateur FPS' },
  { href: '#payments', label: 'Paiement' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08]',
        scrolled ? 'bg-[#060608]' : 'bg-[#060608]/90'
      )}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3.5 lg:px-10">
        <Link href="/" aria-label="FMx — Accueil">
          <Logo size={30} />
        </Link>

        {/* Liens desktop — style Shinami : simple, centré */}
        <div className="hidden items-center gap-8 text-[13px] font-medium text-fmx-gray lg:flex">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="hidden text-[13px] font-medium text-fmx-gray transition-colors hover:text-white sm:block"
          >
            Dashboard
          </a>
          <a
            href="/api/auth/discord"
            className="hidden min-[480px]:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.12]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.73 4.87a18.2 18.2 0 0 0-4.5-1.42c-.22.4-.42.83-.6 1.27a16.13 16.13 0 0 0-4.56 0c-.18-.44-.38-.87-.6-1.27a18.18 18.18 0 0 0-4.5 1.42C2.53 9.1 1.67 13.2 1.89 17.27a18.43 18.43 0 0 0 5.52 2.78c.44-.6.83-1.23 1.14-1.9a12.4 12.4 0 0 1-1.8-.86c.15-.11.3-.22.44-.35a12.9 12.9 0 0 0 6.6 0c.14.13.29.24.44.35a12.4 12.4 0 0 1-1.8.86c.31.67.7 1.3 1.14 1.9a18.43 18.43 0 0 0 5.52-2.78c.37-4.74-1.02-8.84-1.35-10.4ZM9.39 14.55c-1.02 0-1.86-.94-1.86-2.09 0-1.15.82-2.09 1.86-2.09 1.03 0 1.87.94 1.87 2.09 0 1.15-.84 2.09-1.87 2.09Zm5.16 0c-1.02 0-1.86-.94-1.86-2.09 0-1.15.82-2.09 1.86-2.09 1.03 0 1.87.94 1.87 2.09 0 1.15-.84 2.09-1.87 2.09Z" />
            </svg>
            Login Discord
          </a>
          <a
            href="#plans"
            className="rounded-full bg-fmx-red px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(255,26,26,0.35)] transition-transform duration-200 hover:-translate-y-px sm:px-5"
          >
            Commander →
          </a>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="rounded-lg border border-white/10 p-2 text-white lg:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-white/[0.08] bg-fmx-black/95 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-fmx-gray hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/auth/login"
              className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-fmx-gray hover:bg-white/5 hover:text-white"
            >
              Espace client
            </a>
            <a
              href="/api/auth/discord"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-[#5865F2] px-3 py-3 text-center text-sm font-bold text-white min-[480px]:hidden"
            >
              Login Discord
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
