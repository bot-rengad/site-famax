# FMX Optimisation — Panel Complet Clé en Main

> **L'optimisation PC ultime pour gamers exigeants** — FPS Maximaux & Latence Zéro

## 🎮 Vue d'ensemble

Application web full-stack moderne pour la vente et la gestion d'optimisations PC gaming. Architecture modulaire, sécurisée et performante avec :

- **Landing Page** : Vitrine commerciale avec benchmarks, tarifs et tunnel d'achat
- **Dashboard Client** : Espace membre sécurisé avec checklist interactive, assistant IA, téléchargements
- **API Backend** : REST API complète (Auth, Commandes, Licences, Tickets, Scripts)
- **Base de données** : SQLite (dev) / PostgreSQL (prod) avec Prisma ORM

## 🛠 Stack Technique

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS 3.4, CSS Variables, Animations Framer Motion |
| **Database** | Prisma ORM, SQLite (dev) / PostgreSQL (prod) |
| **Auth** | JWT (jose), HttpOnly Cookies, bcryptjs |
| **Validation** | Zod |
| **UI Components** | Composants custom (Button, Card, Modal, Tabs, Progress, etc.) |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod Resolvers |

## 🎨 Design System — Charte Graphique Gaming/Esport

### Couleurs Principales
```css
--fmx-black: #080800          /* Noir profond */
--fmx-black-light: #0f0f0f    /* Noir légèrement plus clair */
--fmx-carbon: #141414         /* Gris carbone/anthracite */
--fmx-border: #222222         /* Bordures subtiles */
--fmx-red: #ff1a1a            /* Rouge électrique néon (accent principal) */
--fmx-red-dark: #e50914       /* Rouge foncé pour gradients */
--fmx-white: #ffffff          /* Blanc pur */
--fmx-white-dim: #e0e0e0      /* Blanc atténué */
--fmx-gray: #888888           /* Gris moyen */
```

### Effets Visuels
- **Glassmorphism** : Cartes semi-transparentes avec `backdrop-blur-xl`
- **Dégradés néon** : Linéaires diagonales (135°) rouge/transparent
- **Texture carbone** : Pattern bruit subtil en overlay (opacity 3%)
- **Glow effects** : Ombres néon animées sur éléments interactifs
- **Animations** : Keyframes CSS + Framer Motion (slide, fade, scale, pulse, float)

### Typographies
- **Display** : `Rajdhani` (500/600/700) — Titres, logos, chiffres
- **Body** : `Inter` (300-800) — Texte principal, UI
- **Mono** : `JetBrains Mono` (400/500/600) — Code, scripts, keys

## 📁 Structure du Projet

```
fmx-optimisation/
├── prisma/
│   ├── schema.prisma          # Modèles DB complets
│   └── seed.ts                # Données de démo (checklist, scripts, users)
├── public/
│   ├── images/                # Assets statiques
│   └── scripts/               # Scripts téléchargeables (.ps1, .bat, .reg)
├── src/
│   ├── app/
│   │   ├── api/               # Routes API (REST)
│   │   │   ├── auth/          # register, login, logout, me
│   │   │   ├── orders/        # CRUD commandes
│   │   │   ├── licenses/      # Gestion licences + QR codes
│   │   │   ├── scripts/       # Scripts optimisation (avec contrôle accès)
│   │   │   ├── checklist/     # Progression checklist
│   │   │   ├── ai-assistant/  # Assistant IA diagnostique
│   │   │   └── users/         # Profil, activité
│   │   ├── dashboard/         # Pages espace membre
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── profile/       # Configuration hardware
│   │   │   ├── checklist/     # Checklist FMX interactive
│   │   │   ├── ai-assistant/  # Terminal IA
│   │   │   ├── downloads/     # Zone téléchargements
│   │   │   └── settings/      # Paramètres compte
│   │   ├── auth/              # Pages auth (login, register)
│   │   ├── layout.tsx         # Layout racine + fonts
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Styles globaux + Tailwind
│   ├── components/
│   │   ├── ui/                # Composants de base réutilisables
│   │   ├── layout/            # Header, Footer, DashboardLayout
│   │   ├── landing/           # Hero, Benchmarks, Pricing, OrderForm
│   │   ├── dashboard/         # Composants spécifiques dashboard
│   │   └── forms/             # Formulaires spécialisés
│   ├── lib/
│   │   ├── auth/              # JWT, session, license generation
│   │   ├── db/                # Prisma client singleton
│   │   ├── utils/             # Helpers (cn, format, animate, copy, etc.)
│   │   └── validations/       # Schémas Zod
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # Types TypeScript partagés
│   ├── styles/                # CSS globals + variables
│   └── scripts/               # Scripts utilitaires Node
├── .env.example               # Variables d'environnement template
├── .env                       # Variables locales (ne pas commiter)
├── next.config.js             # Config Next.js
├── tailwind.config.ts         # Config Tailwind + thème FMX
├── tsconfig.json              # Config TypeScript
└── package.json               # Dépendances
```

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 20+
- pnpm (recommandé) ou npm/yarn

### Installation
```bash
# 1. Cloner / aller dans le dossier
cd fmx-optimisation

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (JWT_SECRET, DATABASE_URL, etc.)

# 4. Initialiser la base de données
pnpm db:generate   # Génère Prisma Client
pnpm db:push       # Crée les tables SQLite
pnpm db:seed       # Peuple avec données démo

# 5. Lancer en développement
pnpm dev
```

### Accès
- **Landing** : http://localhost:3000
- **Dashboard** : http://localhost:3000/dashboard
- **Admin** : http://localhost:3000/admin (réservé au rôle ADMIN)
- **Prisma Studio** : `pnpm db:studio`

### Comptes de démo (après seed)
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@fmx-optimisation.com | admin123 |
| Client | demo@fmx-optimisation.com | demo1234 |

## 📦 Scripts Disponibles

```bash
pnpm dev              # Serveur dev avec Turbopack
pnpm build            # Build production
pnpm start            # Serveur production
pnpm lint             # ESLint
pnpm db:generate      # prisma generate
pnpm db:push          # prisma db push (dev)
pnpm db:migrate       # prisma migrate dev (prod)
pnpm db:studio        # Interface visuelle DB
pnpm db:seed          # Peupler DB avec données démo
```

## 🔐 Authentification & Sécurité

### JWT Tokens
- **Algorithme** : HS256 (jose)
- **Durée** : 7 jours
- **Stockage** : Cookie HttpOnly + Secure + SameSite=Lax
- **Payload** : `userId`, `email`, `role`, `sessionId`

### Protection Routes
- **Middleware** : Vérification token sur routes `/dashboard/*` et `/api/*`
- **API** : `getSession()` dans chaque route protégée
- **Rôles** : `USER` / `ADMIN` (accès admin aux scripts CRUD)

### Mots de passe
- **Hash** : bcryptjs (cost: 12)
- **Policy** : 8+ chars, majuscule, minuscule, chiffre, spécial

## 💳 Système de Commandes & Licences

### Packs Disponibles
| Pack | Prix | Inclus | Support | Appareils | MàJ |
|------|------|--------|---------|-----------|-----|
| **Basic** | 29€ | Checklist + Scripts base + IA basique | Email 48h | 1 | 1 an |
| **Pro** ⭐ | 59€ | Tout Basic + MSI/Affinity + Réseau + Jeux + ParkControl/ISLC | Prioritaire 24h | 3 | À vie |
| **Ultimate** | 129€ | Tout Pro + Profil sur-mesure (1h visio) + BIOS + Scripts custom + Suivi 30j | 24/7 Discord/Tel | ∞ | À vie |

### Flux Achat
1. Sélection pack → `OrderForm` modal (3 étapes)
2. Choix paiement (Stripe/PayPal/Crypto/Virement/Manuel)
3. Infos client (nom, email)
4. Création commande `PENDING` en DB
5. **Manuel** : Activation immédiate + licence générée
6. **Stripe/PayPal** : Redirection paiement → Webhook → Activation

### Licences
- **Format** : `FMX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX`
- **Validation** : API `/api/licenses` (POST key + deviceId)
- **QR Code** : Généré à la volée pour partage mobile
- **Statuts** : `ACTIVE`, `EXPIRED`, `REVOKED`, `PENDING`

## ✅ Checklist FMX — Modules Complets

La checklist interactive guide l'utilisateur pas à pas (8 catégories, 30+ items) :

| Catégorie | Items | Scripts Inclus |
|-----------|-------|----------------|
| **Sécurité** | 2 | Point restauration, SFC/DISM |
| **Matériel/BIOS** | 3 | XMP/EXPO, C-States, ReBAR |
| **Système & Registre** | 6 | HAGS, Core Isolation, GPU Priority, SFIO, MenuShowDelay, Debloat |
| **Drivers NVIDIA** | 5 | Perfs max, Low Latency Ultra, Threaded Opt, Overlay OFF, Shader Cache |
| **MSI & Affinity** | 4 | MSI GPU/Ethernet/USB, IntPolicy Affinité |
| **Logiciels Dédiés** | 3 | ParkControl, Process Lasso, ISLC |
| **Réseau** | 5 | Green Ethernet OFF, Speed/Duplex, DNS Cloudflare, Purge, QoS/TCP |
| **Optimisation Jeux** | 3 | FSO Disable, DPI Scaling, Configs par jeu |

### Fonctionnalités Checklist
- ✅ Cases à cocher persistées (DB)
- 📊 Jauges de progression par catégorie + globale
- 📋 Scripts copiables en 1 clic (bouton copy)
- 📥 Téléchargement direct fichiers `.ps1/.bat/.reg`
- 🔄 État temps réel (completed, pending, required)

## 🤖 Assistant IA Intégré

Terminal interactif analysant les problèmes utilisateur :

### Exemples de requêtes
- *"Micro-freeze en 1v1 sur Valorant"*
- *"High ping 80ms sur serveur FR"*
- *"Stutter toutes les 30 secondes"*
- *"CPU 100% en jeu, FPS instables"*

### Réponse IA
```json
{
  "analysis": "Analyse de votre problème...",
  "recommendations": [
    {
      "category": "msi-affinity",
      "title": "Activer MSI sur GPU",
      "priority": "high",
      "scriptId": "gpu_msi_enable",
      "checklistItemIds": ["msi-gpu"]
    }
  ],
  "quickActions": [
    { "label": "Lancer script MSI GPU", "action": "run_script", "payload": {"scriptId": "gpu_msi_enable"} },
    { "label": "Ouvrir checklist MSI", "action": "open_checklist", "payload": {"category": "msi-affinity"} }
  ]
}
```

### Base de connaissances (mots-clés → solutions)
- `micro-freeze` → Core Isolation, HAGS
- `high-ping` → Green Ethernet, DNS, QoS
- `low-fps` → NVIDIA Panel, GPU Priority
- `input-lag` → MSI, Affinité CPU, Timer Resolution
- `stutter` → ISLC, RAM Standby, Core Parking
- `packet-loss` → QoS, TCP/IP, MTU
- `crash` → Point restauration, XMP, Températures

## 📥 Zone Téléchargements

Scripts organisés par catégorie avec contrôle d'accès selon le pack :

| Catégorie | Scripts Exemples | Pack Requis |
|-----------|------------------|-------------|
| System Cleanup | Nettoyage cache, SFC/DISM | Basic |
| Timer Resolution | Timer 0.5ms, ISLC config | Basic |
| Power Management | USB/Ethernet eco, ParkControl | Pro |
| Registry Tweaks | GPU Priority, SFIO, Debloat | Pro |
| GPU Optimization | MSI GPU, NVIDIA Profile | Pro |
| Network | DNS, Purge, QoS, Green Ethernet | Pro |
| Game Specific | FSO Disable, Configs Fortnite/Valorant | Pro |
| Full Automation | Pack complet tout-en-un | Ultimate |

## 🎯 Dashboard Client — Fonctionnalités

### Vue d'ensemble (`/dashboard`)
- **Stats globales** : Progression %, Licence active, Scripts DL, Performance est.
- **Checklist progression** : Barres par catégorie + % global
- **Recommandations IA** : 3 actions prioritaires contextuelles
- **Actions rapides** : Continuer checklist, DL scripts, IA, Optimiser jeu
- **Derniers scripts** : 4 derniers avec compteur téléchargements
- **Config hardware** : Résumé CPU/GPU/RAM/Stockage/OS/Jeu

### Profil (`/dashboard/profile`)
- Formulaire complet hardware (CPU, GPU, RAM, CM, Stockage, OS, Écran, Souris, Clavier)
- Jeu favori pour optimisations ciblées
- Sauvegarde auto + validation Zod

### Checklist (`/dashboard/checklist`)
- Onglets par catégorie (8)
- Items avec description, script copy/download
- Progression visuelle (circulaire + barres)
- Persistance temps réel (optimistic UI)

### Assistant IA (`/dashboard/ai-assistant`)
- Terminal style console gaming
- Historique conversations
- Actions rapides (run script, open checklist, create ticket)
- Contexte hardware auto-injecté

### Téléchargements (`/dashboard/downloads`)
- Grille filtrable par catégorie
- Badges pack requis (Basic/Pro/Ultimate)
- Téléchargement direct + copy raw
- Compteur téléchargements

### Paramètres (`/dashboard/settings`)
- Infos compte (email, nom, avatar)
- Changement mot de passe
- Notifications (email, push, discord)
- Sécurité (2FA, sessions actives, logs activité)
- Danger zone (suppression compte)

## 🛡 Administration

### Accès Admin
- Interface Prisma Studio : `pnpm db:studio`
- Routes API admin : `role === 'ADMIN'` requis
- Gestion scripts (CRUD) : `/api/scripts` POST/PUT/DELETE

### Logs d'activité
- Table `ActivityLog` : Toutes actions utilisateur
- Filtrage par user, action, date
- Export possible via Prisma Studio

## 🔧 Configuration Avancée

### Variables d'Environnement Critiques
```env
# Sécurité - OBLIGATOIRE EN PROD
JWT_SECRET="votre-cle-super-secrete-min-32-caracteres-aleatoires"

# Base de données
DATABASE_URL="postgresql://user:pass@host:5432/fmx?schema=public"

# Email (pour vérif, reset pwd, notifications)
SMTP_HOST="smtp.votre-fournisseur.com"
SMTP_PORT="587"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASSWORD="votre-mot-de-passe-smtp"

# Paiement (configurer pour production)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
```

### Personnalisation Thème
Éditer `tailwind.config.ts` :
- Couleurs : Section `theme.extend.colors.fmx`
- Fonts : `theme.extend.fontFamily`
- Animations : `theme.extend.animation` + `keyframes`
- Ombres : `theme.extend.boxShadow`

### Ajouter des Scripts
1. Via Prisma Studio ou API Admin (`POST /api/scripts`)
2. Ou dans `prisma/seed.ts` pour seed initial
3. Fichiers physiques dans `public/scripts/` pour DL direct

## 🚀 Déploiement Production

### Vercel (Recommandé)
```bash
# 1. Push sur GitHub
# 2. Import sur Vercel
# 3. Configurer Variables d'env (copier .env.production)
# 4. Build Command: pnpm build
# 5. Output Directory: .next
# 6. Install Command: pnpm install
```

### Docker
```dockerfile
# Dockerfile.example
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Base de Données Prod
```bash
# PostgreSQL (recommandé)
# 1. Créer DB sur provider (Supabase, Neon, Railway, etc.)
# 2. Mettre à jour DATABASE_URL dans .env
# 3. pnpm db:migrate (au lieu de db:push)
# 4. pnpm db:seed
```

### HTTPS & Sécurité
- Vercel gère SSL auto
- Headers sécurité dans `next.config.js`
- Cookies Secure en prod
- CSP recommandé pour production

## 📝 Licence & Crédits

**FMX Optimisation** — Développé par un Senior Full-Stack & UI/UX Designer

### Dépendances Principales
- Next.js, React, TypeScript — Vercel
- Tailwind CSS — Tailwind Labs
- Prisma — Prisma Team
- Framer Motion — Framer
- Lucide Icons — Lucide Contributors
- jose (JWT) — panva
- Zod — Colin McDonnell

---

## 🤝 Support & Contact

- **Email** : support@fmx-optimisation.com
- **Discord** : https://discord.gg/fmx
- **Documentation** : /docs (à implémenter)

---

*Fait avec ❤️ pour la communauté gaming — FMX Optimisation 2024*