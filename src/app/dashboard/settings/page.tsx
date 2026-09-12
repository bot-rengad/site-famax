'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Lock, Shield, Bell, Globe, Trash2, Save, Loader2,
  CheckCircle, AlertCircle, Eye, EyeOff, LogOut, Key, Smartphone, Monitor,
  Settings, Download
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'sessions' | 'danger'>('profile')
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    email: true,
    push: true,
    discord: false,
    marketing: false,
    security: true,
    updates: true,
  })
  const [sessions, setSessions] = useState<any[]>([])
  const [discordInfo, setDiscordInfo] = useState<{ username: string | null; globalName: string | null; verified: boolean }>({ username: null, globalName: null, verified: false })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setProfileData({ name: data.user.name || '', email: data.user.email || '' })
          setDiscordInfo({
            username: data.user.discordUsername,
            globalName: data.user.discordGlobalName,
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

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })
      if (!res.ok) throw new Error('Erreur')
      toast.success('Profil mis à jour')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      })
      if (!res.ok) throw new Error('Erreur')
      toast.success('Mot de passe modifié')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      toast.error('Erreur - Vérifiez votre mot de passe actuel')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
    // Save to server
    fetch('/api/users/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    }).catch(() => {})
  }

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
          <p className="text-fmx-white-dim">Gérez votre compte, sécurité et préférences</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full flex-wrap gap-2 mb-6">
          <TabsTrigger value="profile" className="flex-1 min-w-0 justify-center gap-2">
            <User className="w-4 h-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 min-w-0 justify-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 min-w-0 justify-center gap-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
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

        {/* Profile Tab */}
        <TabsContent value="profile">
          {/* Vérification Discord */}
          <Card variant="glass" padding="lg" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#5865F2]" aria-hidden="true">
                  <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                </svg>
                Vérification Discord
                {discordInfo.verified ? (
                  <Badge variant="green" dot>Vérifié</Badge>
                ) : (
                  <Badge variant="yellow" dot>En attente</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Liez votre compte Discord : votre nom d'affichage devient votre pseudo FMX officiel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {discordInfo.verified ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-fmx-carbon/50 border border-fmx-border/40">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-fmx-white">{discordInfo.globalName || discordInfo.username}</p>
                    <p className="text-xs text-fmx-gray">Compte Discord lié : @{discordInfo.username}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-fmx-white-dim">
                    Votre compte n'est pas encore vérifié. La vérification prend moins de 30 secondes.
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

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-fmx-red" />
                Informations du Compte
              </CardTitle>
              <CardDescription>Ces informations sont visibles sur votre espace membre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nom complet"
                placeholder="Votre nom"
                value={profileData.name}
                onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                iconLeft={<User className="w-5 h-5" />}
              />
              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                value={profileData.email}
                onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                iconLeft={<Mail className="w-5 h-5" />}
                disabled
              />
              <p className="text-xs text-fmx-gray">L'email ne peut pas être modifié ici. Contactez le support pour le changer.</p>
              <Button variant="neon" onClick={handleProfileSave} loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-fmx-red" />
                Changer le Mot de Passe
              </CardTitle>
              <CardDescription>Utilisez un mot de passe fort et unique (min 8 caractères, majuscule, minuscule, chiffre, spécial)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Mot de passe actuel"
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                iconLeft={<Lock className="w-5 h-5" />}
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                iconLeft={<Key className="w-5 h-5" />}
                hint="Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial"
              />
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                iconLeft={<Key className="w-5 h-5" />}
              />
              <Button variant="neon" onClick={handlePasswordChange} loading={saving} disabled={!passwordData.currentPassword || !passwordData.newPassword}>
                <Save className="w-4 h-4 mr-2" />
                Modifier le mot de passe
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg" className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-fmx-red" />
                Authentification à deux facteurs (2FA)
              </CardTitle>
              <CardDescription>Ajoutez une couche de sécurité supplémentaire à votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-fmx-white">Non activé</p>
                  <p className="text-fmx-white-dim text-sm">Configurez 2FA avec une application d'authentification (Google Authenticator, Authy, etc.)</p>
                </div>
                <Button variant="ghost" disabled>
                  <Shield className="w-4 h-4 mr-2" />
                  Activer 2FA (bientôt)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-fmx-red" />
                Préférences de Notification
              </CardTitle>
              <CardDescription>Choisissez ce que vous souhaitez recevoir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'security', label: 'Alertes de sécurité', desc: 'Connexions suspectes, changements de mot de passe, 2FA', icon: Shield, critical: true },
                { key: 'email', label: 'Notifications par email', desc: 'Réponses aux tickets, confirmations de commande, news importantes', icon: Mail },
                { key: 'push', label: 'Notifications push navigateur', desc: 'Alertes en temps réel même quand le site est fermé', icon: Bell },
                { key: 'updates', label: 'Mises à jour FMX', desc: 'Nouvelles versions, scripts, optimisations disponibles', icon: Globe },
                { key: 'discord', label: 'Notifications Discord', desc: 'Lier votre compte Discord pour recevoir les alertes', icon: Globe },
                { key: 'marketing', label: 'Offres et actualités', desc: 'Promotions, événements, newsletter mensuelle', icon: Globe },
              ].map(item => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-fmx-carbon/50 border border-fmx-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-fmx-red/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-fmx-red" />
                    </div>
                    <div>
                      <p className="font-medium text-fmx-white">{item.label}</p>
                      <p className="text-fmx-white-dim text-sm">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={e => handleNotificationChange(item.key, e.target.checked)}
                      disabled={item.critical}
                      className="peer w-11 h-6 appearance-none rounded-full bg-fmx-border peer-checked:bg-fmx-red peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-fmx-white after:rounded-full after:transition-transform after:duration-200"
                    />
                    {item.critical && <span className="ml-2 text-xs text-fmx-gray">Obligatoire</span>}
                  </label>
                </motion.div>
              ))}
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
              <Button
                variant="ghost"
                className="mt-4 w-full"
                onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.reload())}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion de toutes les sessions
              </Button>
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
                      Supprime définitivement votre compte, toutes vos données, licences, progression checklist et historique.
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
                <p className="text-fmx-white-dim mb-4">Téléchargez toutes vos données personnelles au format JSON</p>
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
                  Demander l'export de mes données
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
        message="Cette action est DÉFINITIVE et IRRÉVERSIBLE. Toutes vos données (profil, licences, progression, tickets, scripts) seront supprimées. Êtes-vous absolument certain ?"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!showRevokeModal}
        onClose={() => setShowRevokeModal(null)}
        onConfirm={() => { if (showRevokeModal) handleRevokeSession(showRevokeModal) }}
        title="Révoquer cette session ?"
        message="Cette session sera déconnectée immédiatement. Vous devrez vous reconnecter sur cet appareil."
        confirmText="Révoquer"
        variant="danger"
      />
    </div>
  )
}