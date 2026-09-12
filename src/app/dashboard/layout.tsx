'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Logo } from '@/components/ui/Logo'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, desc: 'Ton parcours : commande → opti' },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, desc: 'Compte Discord, sécurité' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Ne déconnecte QUE si le serveur répond explicitement 401 (session expirée).
    // Une erreur réseau temporaire ne doit jamais déconnecter l'utilisateur.
    fetch('/api/users/me')
      .then(async res => {
        if (res.status === 401) {
          window.location.href = '/auth/login'
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-fmx-black">
      {/* Halo rouge d'ambiance — même thème que la page d'accueil */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(60% 45% at 85% -10%, rgba(229,9,20,0.08), transparent 70%), radial-gradient(50% 40% at 0% 110%, rgba(229,9,20,0.06), transparent 70%)',
        }}
        aria-hidden="true"
      />
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={cn(
          'fixed left-0 top-0 h-screen z-50 bg-fmx-black-light/90 backdrop-blur-xl border-r border-white/[0.08] transition-transform duration-300 ease-expo',
          'lg:translate-x-0',
          sidebarOpen ? 'w-72' : 'w-20'
        )}
        style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 border-b border-white/[0.08]">
            <Link href="/dashboard" className="flex items-center gap-3" aria-label="FMX Dashboard">
              <Logo size={40} />
              {sidebarOpen && (
                <span className="font-display font-bold text-heading-md text-fmx-white">Dashboard</span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1 rounded-lg hover:bg-fmx-carbon transition-colors"
              aria-label={sidebarOpen ? 'Réduire la barre latérale' : 'Étendre la barre latérale'}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-fmx-white" /> : <ChevronRight className="w-5 h-5 text-fmx-white" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Navigation principale">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                    'group',
                    isActive
                      ? 'bg-fmx-red/10 border border-fmx-red/30 text-fmx-red'
                      : 'text-fmx-white-dim hover:text-fmx-white hover:bg-fmx-carbon hover:border-fmx-border/50 border border-transparent'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={sidebarOpen ? undefined : item.label}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    isActive ? 'bg-fmx-red/20' : 'bg-fmx-carbon'
                  )}>
                    <Icon className={cn('w-5 h-5', isActive ? 'text-fmx-red' : 'text-fmx-gray')} aria-hidden="true" />
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-display font-medium text-sm truncate">{item.label}</p>
                      <p className="text-xs text-fmx-gray truncate">{item.desc}</p>
                    </div>
                  )}
                  {isActive && sidebarOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-fmx-red rounded-r-full" />
                  )}
                </Link>
              )
            })}

            {/* Lien Discord */}
            {sidebarOpen && (
              <div className="mt-6 pt-6 border-t border-white/[0.08]">
                <a
                  href="https://discord.gg/fmx"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 hover:bg-[#5865F2]/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#8b9bff]" aria-hidden="true" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-display font-medium text-sm text-fmx-white">Serveur Discord</p>
                    <p className="text-xs text-fmx-gray truncate">Tickets, preuves, support</p>
                  </div>
                </a>
              </div>
            )}
          </nav>

          {/* User & Actions */}
          <div className="p-4 border-t border-white/[0.08]">
            {sidebarOpen ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-fmx-white-dim hover:text-fmx-white hover:bg-fmx-carbon transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Paramètres</span>
                </Link>
                <Link
                  href="/dashboard/tickets"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-fmx-white-dim hover:text-fmx-white hover:bg-fmx-carbon transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Support</span>
                </Link>
                <button
                  onClick={() => window.location.href = '/api/auth/logout'}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-fmx-red hover:bg-fmx-red/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link href="/dashboard/settings" className="p-2 rounded-lg text-fmx-gray hover:text-fmx-white hover:bg-fmx-carbon transition-colors" title="Paramètres">
                  <Settings className="w-5 h-5" />
                </Link>
                <Link href="/dashboard/tickets" className="p-2 rounded-lg text-fmx-gray hover:text-fmx-white hover:bg-fmx-carbon transition-colors" title="Support">
                  <HelpCircle className="w-5 h-5" />
                </Link>
                <button onClick={() => window.location.href = '/api/auth/logout'} className="p-2 rounded-lg text-fmx-red hover:bg-fmx-red/10 transition-colors" title="Déconnexion">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed bottom-6 left-6 z-40 lg:hidden w-14 h-14 rounded-xl bg-gradient-to-br from-fmx-red to-fmx-red-dark flex items-center justify-center shadow-neon-red animate-pulse-neon"
        aria-label="Ouvrir le menu"
      >
        <LayoutDashboard className="w-7 h-7 text-fmx-white" />
      </button>

      {/* Main Content */}
      <main
        className={cn(
          'relative z-10 min-h-screen transition-all duration-300 ease-expo',
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-fmx-black/80 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="flex items-center justify-between h-16 px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-heading-lg text-fmx-white">
                {navItems.find(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg bg-fmx-carbon/50 border border-fmx-border/50 hover:border-fmx-red/30 hover:bg-fmx-carbon transition-colors">
                <Bell className="w-5 h-5 text-fmx-white-dim" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-fmx-red rounded-full" />
              </button>

              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fmx-red to-fmx-red-dark flex items-center justify-center font-display font-bold text-fmx-white text-sm" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
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