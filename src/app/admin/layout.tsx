'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShoppingCart,
  LogOut, Loader2, ChevronLeft, ChevronRight, UserCheck, Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Logo } from '@/components/ui/Logo'

const navItems = [
  { id: 'overview', href: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'online', href: '/admin#online', label: 'En ligne', icon: UserCheck },
  { id: 'users', href: '/admin#users', label: 'Utilisateurs', icon: Users },
  { id: 'orders', href: '/admin#orders', label: 'Commandes', icon: ShoppingCart },
]

const TAB_TITLES: Record<string, string> = {
  overview: 'Vue d\'ensemble',
  online: 'Connectés',
  users: 'Utilisateurs',
  orders: 'Commandes',
  licenses: 'Licences',
  tickets: 'Support',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [checking, setChecking] = useState(true)
  // Onglet actif suivi en direct (les liens sidebar ne semblaient pas répondre)
  const [hash, setHash] = useState('')

  // Garde de sécurité : seul un compte ADMIN accède au panel
  useEffect(() => {
    // Sur mobile on démarre avec le menu fermé (sinon il recouvre tout l'écran)
    if (window.innerWidth < 1024) setSidebarOpen(false)
    const syncHash = () => setHash(window.location.hash.replace('#', ''))
    syncHash()
    window.addEventListener('hashchange', syncHash)
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== 'ADMIN') {
          router.replace('/dashboard')
          return
        }
        setChecking(false)
      })
      .catch(() => router.replace('/auth/login'))
    return () => window.removeEventListener('hashchange', syncHash)
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-fmx-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-fmx-red animate-spin" />
        <p className="font-display text-fmx-white-dim">Vérification des accès administrateur...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fmx-black">
      {/* Fond assombri mobile quand le menu est ouvert */}
      {sidebarOpen && (
        <button
          aria-label="Fermer le menu admin"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 overflow-hidden border-r border-white/[0.08] bg-fmx-black-light transition-all duration-300 ease-expo',
          // Mobile : tiroir qui sort/rentre. Desktop : rail 80px, fond opaque (aucun titre qui transparaît).
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo — réduit : petit logo centré qui tient dans le rail 80px, sinon il débordait sur le titre */}
          <div className={cn(
            'border-b border-white/[0.08]',
            sidebarOpen ? 'flex h-16 lg:h-20 flex-row items-center justify-between px-4' : 'flex flex-col items-center justify-center gap-2 px-2 py-3'
          )}>
            <Link href="/admin" className={cn('flex items-center gap-3', sidebarOpen ? 'min-w-0 flex-1' : 'flex-none justify-center')} aria-label="FMX Admin" onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false) }}>
              <span className="shrink-0 leading-none"><Logo size={sidebarOpen ? 36 : 26} /></span>
              {sidebarOpen && <span className="truncate text-sm font-bold text-white lg:hidden">Admin FMX</span>}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0 rounded-lg p-2 hover:bg-fmx-carbon transition-colors min-h-[40px] min-w-[40px] place-content-center"
              aria-label={sidebarOpen ? 'Réduire' : 'Étendre'}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-fmx-white" /> : <ChevronRight className="w-5 h-5 text-fmx-white" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = item.id === 'overview' ? pathname === '/admin' && !hash : hash === item.id
              return (
                // <a> natif + hash assigné à la main : Next avale les ancres
                // via pushState (sans hashchange), ici le clic change vraiment d'onglet.
                <a
                  key={item.href}
                  href={item.href}
                  onClick={e => {
                    e.preventDefault()
                    if (item.id === 'overview') {
                      window.location.hash = ''
                      router.push('/admin')
                    } else {
                      window.location.hash = item.id
                    }
                    if (window.innerWidth < 1024) setSidebarOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl transition-all duration-200 border overflow-hidden whitespace-nowrap',
                    sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 lg:justify-center lg:px-0',
                    isActive
                      ? 'bg-fmx-red/10 border-fmx-red/30 text-fmx-red'
                      : 'border-transparent text-fmx-white-dim hover:text-fmx-white hover:bg-fmx-carbon'
                  )}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={cn('truncate font-display font-medium text-sm', !sidebarOpen && 'lg:hidden')}>{item.label}</span>
                </a>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="p-4 border-t border-white/[0.08] space-y-2">
            <Link
              href="/dashboard"
              className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-fmx-white-dim hover:text-fmx-white hover:bg-fmx-carbon transition-colors overflow-hidden whitespace-nowrap', !sidebarOpen && 'lg:justify-center lg:px-0')}
              title="Espace client"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className={cn('truncate font-medium', !sidebarOpen && 'lg:hidden')}>Espace client</span>
            </Link>
            <button
              onClick={() => (window.location.href = '/api/auth/logout')}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-fmx-red hover:bg-fmx-red/10 transition-colors overflow-hidden whitespace-nowrap', !sidebarOpen && 'lg:justify-center lg:px-0')}
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={cn('truncate font-medium', !sidebarOpen && 'lg:hidden')}>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        className={cn('min-h-screen transition-all duration-300 ease-expo', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.08] bg-fmx-black px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-white transition-colors hover:bg-white/[0.06] lg:hidden"
            aria-label={sidebarOpen ? 'Fermer le menu admin' : 'Ouvrir le menu admin'}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate font-display text-heading-lg text-fmx-white">{TAB_TITLES[hash] || 'Administration'}</h1>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
