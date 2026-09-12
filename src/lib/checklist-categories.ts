// Contenu reserve aux clients payants - ne doit JAMAIS etre importe dans les pages publiques
export const CHECKLIST_CATEGORIES = [
  {
    id: 'security',
    name: 'Sécurité',
    icon: 'shield',
    description: 'Création point de restauration système',
    order: 1,
  },
  {
    id: 'hardware-bios',
    name: 'Matériel / BIOS',
    icon: 'cpu',
    description: 'Vérification profils XMP/EXPO, réglages BIOS',
    order: 2,
  },
  {
    id: 'system-registry',
    name: 'Système & Registre',
    icon: 'database',
    description: 'HAGS, Core Isolation, Registre multimédia, Debloat',
    order: 3,
  },
  {
    id: 'nvidia-drivers',
    name: 'Drivers NVIDIA',
    icon: 'monitor',
    description: 'Panneau NVIDIA : Latence ultra, Perfs max, Threaded Opt',
    order: 4,
  },
  {
    id: 'msi-affinity',
    name: 'MSI Utility & Affinity',
    icon: 'zap',
    description: 'Activation MSI GPU/Ethernet/USB, IntPolicy, Affinité CPU',
    order: 5,
  },
  {
    id: 'dedicated-software',
    name: 'Logiciels Dédiés',
    icon: 'settings',
    description: 'ParkControl, Process Lasso, ISLC configuration',
    order: 6,
  },
  {
    id: 'network',
    name: 'Réseau',
    icon: 'globe',
    description: 'Green Ethernet, Speed/Duplex, DNS Cloudflare, Scripts purge',
    order: 7,
  },
  {
    id: 'game-optimization',
    name: 'Optimisation Jeux',
    icon: 'gamepad-2',
    description: 'Fullscreen opt, DPI scaling, configs par jeu',
    order: 8,
  },
]

export type ChecklistCategoryId = typeof CHECKLIST_CATEGORIES[number]['id']
