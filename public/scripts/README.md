# FMX Optimisation - Scripts d'Automatisation

## 📁 Organisation par Catégorie

| Catégorie | Fichiers | Pack Requis | Description |
|-----------|----------|-------------|-------------|
| **SYSTEM_CLEANUP** | `restore_point.bat`, `cleanup_cache.bat`, `sfc_dism.bat` | BASIC | Points restauration, nettoyage caches, intégrité fichiers |
| **TIMER_RESOLUTION** | `timer_resolution.bat`, `islc_config.ini` | BASIC | Timer 0.5ms, ISLC config |
| **POWER_MANAGEMENT** | `disable_green_ethernet.bat`, `parkcontrol_config.ini`, `processlasso_config.ini` | PRO | Économie énergie USB/Ethernet, Core Parking, Process Lasso |
| **REGISTRY_TWEAKS** | `hags_enable.reg`, `disable_core_isolation.reg`, `gpu_priority.reg`, `menushowdelay.reg`, `debloat.reg` | PRO | GPU Scheduling, Core Isolation, GPU Priority, MenuDelay, Debloat |
| **GPU_OPTIMIZATION** | `gpu_msi_enable.bat`, `nvidia_profile.nip`, `disable_gfe_overlay.reg` | PRO | MSI GPU, Profil NVIDIA, Overlay GFE |
| **NETWORK_OPTIMIZATION** | `network_optimize.bat`, `dns_cloudflare.bat`, `network_purge.bat`, `qos_gaming.bat`, `force_speed_duplex.bat` | PRO | Green Ethernet, DNS Cloudflare, Purge, QoS, Speed/Duplex |
| **GAME_SPECIFIC** | `disable_fso.bat`, `dpi_scaling.reg`, `game_configs_pack.zip` | PRO | FSO Disable, DPI Scaling, Configs Fortnite/Valorant/CS2 |
| **DEBLOAT** | `debloat.bat`, `disable_telemetry.reg` | BASIC | Suppression apps, télémétrie, services |
| **FULL_AUTOMATION** | `fmx_full_automation.ps1` | ULTIMATE | Script tout-en-un orchestré |

## 🚀 Utilisation

### Méthode 1: Téléchargement direct (Dashboard)
1. Connectez-vous à votre espace membre
2. Allez dans **Téléchargements**
3. Filtrez par catégorie ou pack
4. Cliquez **Télécharger** ou **Copier**

### Méthode 2: Exécution manuelle
```cmd
# En tant qu'Administrateur
script_name.bat

# Pour .reg
Double-clic > Oui > Redémarrer

# Pour .ini (ISLC, Process Lasso, ParkControl)
Importer via l'interface du logiciel
```

### Méthode 3: PowerShell (scripts avancés)
```powershell
# Exécution directe
powershell -ExecutionPolicy Bypass -File script.ps1

# Ou copier-coller le contenu dans PowerShell Admin
```

## ⚠️ Prérequis & Sécurité

1. **TOUJOURS** créer un point de restauration avant (`restore_point.bat`)
2. Exécuter en **Administrateur** (clic droit > Exécuter en tant qu'administrateur)
3. **Redémarrage requis** après fichiers `.reg` et modifications système
4. Sauvegardez vos réglages BIOS/UEFI avant modifications
5. Testez un script à la fois pour identifier les problèmes

## 🎮 Ordre Recommandé (Checklist FMX)

1. **Sécurité** → `restore_point.bat`
2. **Matériel/BIOS** → XMP/EXPO, C-States, ReBAR (manuel BIOS)
3. **Système** → `hags_enable.reg`, `disable_core_isolation.reg`, `gpu_priority.reg`, `debloat.bat`
4. **NVIDIA** → Panneau NVIDIA manuel + `nvidia_profile.nip` + `disable_gfe_overlay.reg`
5. **MSI/Affinity** → `gpu_msi_enable.bat` (ou MSI Utility), `ethernet_msi_enable.bat`, `intpolicy.ps1`
4. **Logiciels** → ISLC (`islc_config.ini`), Process Lasso (`processlasso_config.ini`), ParkControl (`parkcontrol_config.ini`)
5. **Réseau** → `network_optimize.bat`, `dns_cloudflare.bat`, `qos_gaming.bat`
6. **Jeux** → `disable_fso.bat`, configs spécifiques

## 🔧 Personnalisation

- **ISLC**: Ajustez `StandbyThresholdMB` selon votre RAM (512/1024/2048/4096 MB)
- **Process Lasso**: Ajoutez vos `.exe` jeux dans `ProBalanceExcludeList`
- **QoS**: Testez MTU avec `ping -f -l 1472 1.1.1.1`
- **Jeux**: Ajoutez vos chemins `.exe` dans `disable_fso.bat`

## 📞 Support

- **Dashboard** → Assistant IA pour diagnostic
- **Tickets** → Support technique personnalisé
- **Discord** → Communauté + support temps réel

---

*Scripts maintenus par FMX Optimisation — Mis à jour régulièrement*