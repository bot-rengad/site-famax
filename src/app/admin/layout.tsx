'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShoppingCart, KeyRound, LifeBuoy,
  LogOut, Loader2, ChevronLeft, ChevronRight, UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Logo } from '@/components/ui/Logo'

const navItems = [
  { id: 'overview', href: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'online', href: '/admin#online', label: 'En ligne', icon: UserCheck },
  // Ancres vers les onglets de la console de gestion
  { id: 'users', href: '/admin#users', label: 'Utilisateurs', icon: Users },
  { id: 'orders', href: '/admin#orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'licenses', href: '/admin#licenses', label: 'Licences', icon: KeyRound },
  { id: 'tickets', href: '/admin#tickets', label: 'Support', icon: LifeBuoy },
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
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 bg-fmx-black-light/90 backdrop-blur-xl border-r border-white/[0.08] transition-all duration-300 ease-expo',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 border-b border-white/[0.08]">
            <Link href="/admin" className="flex items-center gap-3" aria-label="FMX Admin">
              <Logo size={40} />
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-1 rounded-lg hover:bg-fmx-carbon transition-colors"
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
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 border',
                    isActive
                      ? 'bg-fmx-red/10 border-fmx-red/30 text-fmx-red'
                      : 'border-transparent text-fmx-white-dim hover:text-fmx-white hover:bg-fmx-carbon'
                  )}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-display font-medium text-sm">{item.label}</span>}
                </a>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="p-4 border-t border-white/[0.08] space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-fmx-white-dim hover:text-fmx-white hover:bg-fmx-carbon transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Espace client</span>}
            </Link>
            <button
              onClick={() => (window.location.href = '/api/auth/logout')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-fmx-red hover:bg-fmx-red/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>

      <main
        className={cn('min-h-screen transition-all duration-300 ease-expo', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}
      >
        <header className="sticky top-0 z-30 bg-fmx-black/95 backdrop-blur-xl border-b border-white/[0.08] h-16 flex items-center px-6 lg:px-8">
          <h1 className="font-display text-heading-lg text-fmx-white">{TAB_TITLES[hash] || 'Administration'}</h1>
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
