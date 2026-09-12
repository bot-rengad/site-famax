'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Trash2, AlertCircle, LogOut, Smartphone, Monitor,
  Settings, Download, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { ConfirmModal } from '@/components/ui/Modal'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'sessions' | 'danger'>('account')
  const [sessions, setSessions] = useState<any[]>([])
  const [discordInfo, setDiscordInfo] = useState<{ username: string | null; globalName: string | null; avatar: string | null; verified: boolean }>({ username: null, globalName: null, avatar: null, verified: false })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setDiscordInfo({
            username: data.user.discordUsername,
            globalName: data.user.discordGlobalName,
            avatar: data.user.discordAvatar,
            verified: Boolean(data.user.discordVerifiedAt),
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Fetch sessions
    fetch('/api/users/sessions')
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []))
      .catch(() => {})
  }, [])

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetch(`/api/users/sessions/${sessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      toast.success('Session révoquée')
    } catch {
      toast.error('Erreur')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/users/account', { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/auth/login'
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fmx-red to-fmx-red-dark flex items-center justify-center">
          <Settings className="w-7 h-7 text-fmx-white" />
        </div>
        <div>
          <h1 className="font-display text-display-sm text-fmx-white">Paramètres</h1>
          <p className="text-fmx-white-dim">Ton compte Discord, tes sessions, tes données</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full flex-wrap gap-2 mb-6">
          <TabsTrigger value="account" className="flex-1 min-w-0 justify-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Compte</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1 min-w-0 justify-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex-1 min-w-0 justify-center gap-2 text-fmx-red">
            <Trash2 className="w-4 h-4" />
            <span>Danger</span>
          </TabsTrigger>
        </TabsList>

        {/* Compte Discord */}
        <TabsContent value="account">
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#5865F2]" aria-hidden="true">
                  <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                </svg>
                Compte Discord
                {discordInfo.verified ? (
                  <Badge variant="green" dot>Vérifié</Badge>
                ) : (
                  <Badge variant="yellow" dot>En attente</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Ton pseudo Discord est ton identifiant FMX : commandes et paiements sont retrouvés grâce à lui.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {discordInfo.verified ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-fmx-carbon/50 border border-fmx-border/40">
                  {discordInfo.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={discordInfo.avatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-fmx-white">{discordInfo.globalName || discordInfo.username}</p>
                    <p className="text-xs text-fmx-gray">@{discordInfo.username}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-fmx-white-dim">
                    Ton compte n&apos;est pas encore vérifié. La vérification prend moins de 30 secondes.
                  </p>
                  <a
                    href="/api/auth/discord"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-semibold text-sm transition-all duration-200 hover:scale-[1.02]"
                  >
                    Vérifier avec Discord
                  </a>
                </>
              )}
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg" className="mt-6">
            <CardContent>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => { window.location.href = '/' })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-fmx-red" />
                Sessions Actives
              </CardTitle>
              <CardDescription>Gérez vos connexions actuelles. Révoquez les sessions suspectes.</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-fmx-white-dim">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 text-fmx-gray" />
                  <p>Aucune session active trouvée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-fmx-carbon/50 border border-fmx-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          session.current ? 'bg-fmx-red/20' : 'bg-fmx-carbon border border-fmx-border/50'
                        )}>
                          {session.deviceType === 'mobile' ? (
                            <Smartphone className={cn('w-6 h-6', session.current ? 'text-fmx-red' : 'text-fmx-gray')} />
                          ) : (
                            <Monitor className={cn('w-6 h-6', session.current ? 'text-fmx-red' : 'text-fmx-gray')} />
                          )}
                        </div>
                        <div>
                          <p className={cn('font-medium', session.current ? 'text-fmx-white' : 'text-fmx-white-dim')}>
                            {session.current ? 'Cette session' : `${session.deviceType === 'mobile' ? 'Mobile' : 'Desktop'}`}
                          </p>
                          <p className="text-xs text-fmx-gray">
                            {session.browser} sur {session.os} • {session.ip}
                          </p>
                          <p className="text-xs text-fmx-gray">
                            Dernière activité : {new Date(session.lastActivity).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-fmx-red hover:bg-fmx-red/10"
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Révoquer
                        </Button>
                      )}
                      {session.current && (
                        <Badge variant="green" dot size="sm">Actuelle</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card variant="bordered" padding="lg" className="border-fmx-red/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-fmx-red">
                <AlertCircle className="w-5 h-5" />
                Zone de Danger
              </CardTitle>
              <CardDescription className="text-fmx-red/80">Actions irréversibles — À utiliser avec précaution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-4 rounded-xl bg-fmx-red/5 border border-fmx-red/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-medium text-fmx-red">Supprimer mon compte</p>
                    <p className="text-fmx-white-dim text-sm mt-1">
                      Supprime définitivement ton compte et toutes tes données.
                      <strong className="text-fmx-red"> Cette action est IRRÉVERSIBLE.</strong>
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                    className="whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                </div>
              </div>

              <div className="border-t border-fmx-border/50 pt-4">
                <h3 className="font-display font-medium text-fmx-white mb-4">Export de données (RGPD)</h3>
                <p className="text-fmx-white-dim mb-4">Télécharge toutes tes données personnelles au format JSON</p>
                <Button variant="ghost" onClick={() => {
                  fetch('/api/users/export')
                    .then(res => res.blob())
                    .then(blob => {
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `fmx-export-${Date.now()}.json`
                      a.click()
                    })
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Demander l&apos;export de mes données
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Supprimer mon compte ?"
        message="Cette action est DÉFINITIVE et IRRÉVERSIBLE. Toutes tes données seront supprimées. Certain ?"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!showRevokeModal}
        onClose={() => setShowRevokeModal(null)}
        onConfirm={() => { if (showRevokeModal) handleRevokeSession(showRevokeModal) }}
        title="Révoquer cette session ?"
        message="Cette session sera déconnectée immédiatement. Tu devras te reconnecter sur cet appareil."
        confirmText="Révoquer"
        variant="danger"
      />
    </div>
  )
}
