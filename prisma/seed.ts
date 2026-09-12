import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('�YO� Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fmx-optimisation.com' },
    update: {},
    create: {
      email: 'admin@fmx-optimisation.com',
      name: 'Admin FMX',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('�o. Admin user created')

  // Create demo user
  const demoPassword = await bcrypt.hash('demo1234', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@fmx-optimisation.com' },
    update: {},
    create: {
      email: 'demo@fmx-optimisation.com',
      name: 'Alex Demo',
      passwordHash: demoPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })
  console.log('�o. Demo user created')

  // Create visitor demo account WITHOUT license (to preview the paywall)
  await prisma.user.upsert({
    where: { email: 'nolic@fmx-optimisation.com' },
    update: {},
    create: {
      email: 'nolic@fmx-optimisation.com',
      name: 'Visiteur Demo',
      passwordHash: demoPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })

  // Create profiles
  await prisma.userProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      cpu: 'Intel i9-13900K',
      gpu: 'NVIDIA RTX 4090 24GB',
      ram: '64GB DDR5-7200',
      motherboard: 'ASUS ROG Maximus Z790 Hero',
      storage: 'Samsung 990 Pro 4TB',
      os: 'Windows 11 Pro 23H2',
      favoriteGame: 'Valorant / CS2',
      monitorRefresh: '360Hz',
      mouseDPI: '800',
      keyboardPolling: '1000Hz',
    },
  })

  await prisma.userProfile.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      cpu: 'Intel i7-13700K',
      gpu: 'NVIDIA RTX 3080 10GB',
      ram: '32GB DDR5-6000 CL30',
      motherboard: 'MSI MPG Z790 Edge WiFi',
      storage: 'Samsung 990 Pro 2TB',
      os: 'Windows 11 Pro 23H2',
      favoriteGame: 'Fortnite',
      monitorRefresh: '240Hz',
      mouseDPI: '1600',
      keyboardPolling: '1000Hz',
    },
  })
  console.log('�o. User profiles created')

  // Create checklist items
  const checklistItems = [
    // Sécurité
    { category: 'security', title: 'Créer un point de restauration système', description: 'Avant toute modification, créez un point de restauration Windows pour pouvoir revenir en arrière en cas de problème.', order: 1, script: 'restore_point.ps1' },
    { category: 'security', title: 'Vérifier l\'intégrité des fichiers système', description: 'Exécuter sfc /scannow et DISM pour réparer les fichiers corrompus.', order: 2, script: 'sfc_dism.ps1' },

    // Matériel / BIOS
    { category: 'hardware-bios', title: 'Activer XMP/EXPO dans le BIOS', description: 'Activer le profil mémoire XMP (Intel) ou EXPO (AMD) pour atteindre la fréquence annoncée de vos barrettes RAM.', order: 1, script: null },
    { category: 'hardware-bios', title: 'Désactiver les économies d\'énergie CPU (C-States)', description: 'Désactiver C-States, EIST, SpeedStep pour une latence constante.', order: 2, script: 'bios_cstates_disable.md' },
    { category: 'hardware-bios', title: 'Activer Above 4G Decoding & Resizable BAR', description: 'Requis pour ReBAR/SAM sur GPU récentes. Activez dans BIOS > PCIe Settings.', order: 3, script: null },

    // Système & Registre
    { category: 'system-registry', title: 'Activer GPU Scheduling (HAGS)', description: 'Windows 10/11: Paramètres > Système > Affichage > Graphiques > Changer les paramètres graphiques par défaut > Activer.', order: 1, script: 'hags_enable.reg' },
    { category: 'system-registry', title: 'Désactiver Core Isolation (Memory Integrity)', description: 'Sécurité Windows > Isolation du noyau > Intégrité de la mémoire : D�?SACTIV�? (requiert redémarrage).', order: 2, script: 'disable_core_isolation.reg' },
    { category: 'system-registry', title: 'Registre: GPU Priority 8 (Tasks) & 6 (Games)', description: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers\\Scheduler\\Tasks\\GPU Priority = 8', order: 3, script: 'registry_gpu_priority.reg' },
    { category: 'system-registry', title: 'Registre: High SFIO Priority & Scheduling', description: 'Priorité E/S haute pour les tâches multimédia. Clés: High SFIO Priority = 1, Scheduling Priority = High.', order: 4, script: 'registry_sfio_priority.reg' },
    { category: 'system-registry', title: 'MenuShowDelay = 0', description: 'Supprime le délai d\'affichage des menus pour une UI plus réactive.', order: 5, script: 'registry_menushowdelay.reg' },
    { category: 'system-registry', title: 'Debloat Windows & Désactiver Télémétrie', description: 'Supprimer apps préinstallées, désactiver télémétrie, services inutiles (DiagTrack, WSearch, etc.).', order: 6, script: 'debloat.ps1' },

    // Drivers NVIDIA
    { category: 'nvidia-drivers', title: 'Mode Gestion Alimentation: Performance Maximale', description: 'Panneau NVIDIA > Gérer les paramètres 3D > Mode gestion de l\'alimentation = Préférer les performances maximales.', order: 1, script: null },
    { category: 'nvidia-drivers', title: 'Faible Latence: Ultra', description: 'Panneau NVIDIA > Faible latence = Ultra (réduit la file d\'attente de rendu CPU).', order: 2, script: null },
    { category: 'nvidia-drivers', title: 'Qualité: Haute Performance', description: 'Filtrage texture: Haute performance, Optimisation threadée: Activé.', order: 3, script: null },
    { category: 'nvidia-drivers', title: 'Désactiver Overlay GeForce Experience', description: 'GeForce Experience > Paramètres > Général > Partage > D�?SACTIV�? (gain 2-3% FPS).', order: 4, script: 'disable_gfe_overlay.reg' },
    { category: 'nvidia-drivers', title: 'Cache Shaders: Activé', description: 'Taille cache: 10GB (ou max), réduit les micro-freeze de compilation shader.', order: 5, script: null },

    // MSI Utility & Affinity
    { category: 'msi-affinity', title: 'Activer MSI sur GPU (Message Signaled Interrupts)', description: 'Utiliser MSI Utility v3: Sélectionner GPU > Activer MSI Mode > Priorité High.', order: 1, script: 'gpu_msi_enable.ps1' },
    { category: 'msi-affinity', title: 'Activer MSI sur Carte Réseau Ethernet', description: 'Gestionnaire de périphériques > Carte réseau > Propriétés > MSI: Activé, Priorité: High.', order: 2, script: 'ethernet_msi_enable.ps1' },
    { category: 'msi-affinity', title: 'Activer MSI sur Contrôleurs USB', description: 'Gestionnaire > Contrôleurs de bus USB > Chaque contrôleur: MSI Activé.', order: 3, script: 'usb_msi_enable.ps1' },
    { category: 'msi-affinity', title: 'Configurer IntPolicy.exe (Affinité CPU Jeu)', description: 'SetProcessAffinityMask: Masque sans c�"urs 0/1 (système). Dédier c�"urs physiques au jeu.', order: 4, script: 'intpolicy_config.ps1' },

    // Logiciels Dédiés
    { category: 'dedicated-software', title: 'ParkControl: Bitsum Highest Performance', description: 'Désactiver complètement le stationnement des c�"urs (Core Parking). Profil: Bitsum Highest Performance.', order: 1, script: 'parkcontrol_config.ini' },
    { category: 'dedicated-software', title: 'Process Lasso: Priorité Processus �?levée', description: 'Lancement auto, Priorité processeur: �?levée, Priorité E/S: Haute, Exclure de ProBalance.', order: 2, script: 'processlasso_config.ini' },
    { category: 'dedicated-software', title: 'ISLC: Timer Resolution 0.50ms', description: 'Timer Resolution: 0.50ms, Seuil RAM Standby: 1024MB (32GB), 2048MB (64GB). Lancement auto.', order: 3, script: 'islc_config.ini' },

    // Réseau
    { category: 'network', title: 'Désactiver Green Ethernet (�?conomie d\'énergie)', description: 'Gestionnaire > Carte réseau > Gestion de l\'alimentation > Décocher "Autoriser l\'ordinateur à éteindre ce périphérique".', order: 1, script: 'disable_green_ethernet.ps1' },
    { category: 'network', title: 'Forcer Speed & Duplex 1.0 Gbps Full Duplex', description: 'Propriétés carte réseau > Avancé > Speed & Duplex = 1.0 Gbps Full Duplex (pas Auto).', order: 2, script: 'force_speed_duplex.ps1' },
    { category: 'network', title: 'DNS Cloudflare 1.1.1.1 / 1.0.0.1', description: 'IPv4: 1.1.1.1 / 1.0.0.1, IPv6: 2606:4700:4700::1111 / ::1001. DoH: Activé.', order: 3, script: 'dns_cloudflare.ps1' },
    { category: 'network', title: 'Scripts Purge DNS / Winsock / IP', description: 'ipconfig /flushdns, netsh winsock reset, netsh int ip reset. Exécuter en admin.', order: 4, script: 'network_purge_all.bat' },
    { category: 'network', title: 'QoS Gaming & Optimisation TCP/IP', description: 'Désactiver Nagle Algorithm (TcpAckFrequency=1), TCP Window Scaling, MTU optimisé (1472).', order: 5, script: 'qos_gaming_tcpip.ps1' },

    // Optimisation Jeux
    { category: 'game-optimization', title: 'Désactiver Optimisations Plein �?cran (FSO)', description: 'Propriétés .exe jeu > Compatibilité > Désactiver les optimisations plein écran. Force DPI: Application.', order: 1, script: 'disable_fso_all_games.ps1' },
    { category: 'game-optimization', title: 'DPI Scaling: Application (pas Système)', description: '�?vite le scaling Windows qui ajoute de la latence. Override DPI scaling behavior.', order: 2, script: 'dpi_scaling_fix.reg' },
    { category: 'game-optimization', title: 'Configs Jeu Spécifiques (Fortnite/Valorant/CS2)', description: 'Launch options, GameUserSettings.ini, NVIDIA Profile Inspector par jeu.', order: 3, script: 'game_configs_pack.zip' },
  ]

  for (const item of checklistItems) {
    await prisma.checklistItem.upsert({
      where: { id: `checklist-${item.category}-${item.order}` },
      update: {},
      create: {
        id: `checklist-${item.category}-${item.order}`,
        ...item,
        isRequired: true,
        isActive: true,
      },
    })
  }
  console.log(`�o. ${checklistItems.length} checklist items created`)

  // Create optimization scripts
  const scripts = [
    {
      name: 'Création Point de Restauration',
      description: 'Crée un point de restauration système Windows avant optimisation',
      category: 'SYSTEM_CLEANUP',
      content: `@echo off
title FMX - Creation Point de Restauration
powershell -Command "Checkpoint-Computer -Description 'FMX Pre-Optimisation' -RestorePointType 'MODIFY_SETTINGS'"
echo Point de restauration créé avec succès.
pause`,
      requiresAdmin: true,
    },
    {
      name: 'Nettoyage Cache Système Complet',
      description: 'Nettoie tous les caches Windows, temporaires, prefetch, logs',
      category: 'SYSTEM_CLEANUP',
      content: `@echo off
title FMX - Nettoyage Cache Systeme
echo === NETTOYAGE CACHE WINDOWS ===

echo [1/6] Nettoyage fichiers temporaires...
del /q /f /s "%TEMP%\*" 2>nul
del /q /f /s "C:\Windows\Temp\*" 2>nul

echo [2/6] Nettoyage Prefetch...
del /q /f /s "C:\Windows\Prefetch\*" 2>nul

echo [3/6] Nettoyage Cache Windows Update...
net stop wuauserv 2>nul
del /q /f /s "C:\Windows\SoftwareDistribution\Download\*" 2>nul
net start wuauserv 2>nul

echo [4/6] Nettoyage Cache DNS...
ipconfig /flushdns

echo [5/6] Nettoyage Corbeille...
powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"

echo [6/6] Nettoyage Logs événements...
wevtutil cl System 2>nul
wevtutil cl Application 2>nul

echo.
echo === NETTOYAGE TERMINE ===
pause`,
      requiresAdmin: true,
    },
    {
      name: 'Timer Resolution 0.5ms',
      description: 'Force la résolution du timer système à 0.5ms pour réduire la latence',
      category: 'TIMER_RESOLUTION',
      content: `@echo off
title FMX - Timer Resolution 0.5ms
echo === TIMER RESOLUTION 0.5MS ===

echo Verification resolution actuelle...
w32tm /query /status | findstr "Resolution"

echo.
echo Application Timer Resolution 0.5ms...
powercfg /setacvalueindex scheme_current sub_processor PERFBOOSTMODE 1
powercfg /setactive scheme_current

echo.
echo Pour rendre permanent, utilisez ISLC (Intelligent Standby List Cleaner)
echo avec Timer Resolution = 0.5ms et lancement automatique.

echo.
echo ASTUCE: Ajoutez cette commande au demarrage via Planificateur de taches:
echo powercfg /setacvalueindex scheme_current sub_processor PERFBOOSTMODE 1
pause`,
      requiresAdmin: true,
    },
    {
      name: 'Désactiver �?conomie �?nergie USB/Ethernet',
      description: 'Désactive la mise en veille sélective USB et l\'économie d\'énergie carte réseau',
      category: 'POWER_MANAGEMENT',
      content: `@echo off
title FMX - Desactivation Economie Energie USB/Ethernet
echo === DESACTIVATION ECONOMIE ENERGIE ===

echo [1/3] USB Selective Suspend...
powercfg /setacvalueindex scheme_current sub_usbsettings usbselectivesuspend 0
powercfg /setdcvalueindex scheme_current sub_usbsettings usbselectivesuspend 0

echo [2/3] PCI Express Link State Power Management...
powercfg /setacvalueindex scheme_current sub_pciexpress aspm L0
powercfg /setdcvalueindex scheme_current sub_pciexpress aspm L0

echo [3/3] Appliquer le profil...
powercfg /setactive scheme_current

echo.
echo Verification carte reseau...
echo Desactivez manuellement dans Gestionnaire de peripheriques:
echo Carte reseau > Proprietes > Gestion de l'alimentation
echo Decochez "Autoriser l'ordinateur a eteindre ce peripherique"

pause`,
      requiresAdmin: true,
    },
    {
      name: 'Activer HAGS (GPU Scheduling)',
      description: 'Active le planificateur GPU avec accélération matérielle (Hardware-Accelerated GPU Scheduling)',
      category: 'SYSTEM_CLEANUP',
      content: `Windows Registry Editor Version 5.00

; Activer HAGS (Hardware-Accelerated GPU Scheduling)
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers]
"HwSchMode"=dword:00000002

; Redémarrage requis après application`,
      requiresAdmin: true,
    },
    {
      name: 'Désactiver Core Isolation',
      description: 'Désactive l\'intégrité de la mémoire (Core Isolation) pour réduire la latence',
      category: 'SYSTEM_CLEANUP',
      content: `Windows Registry Editor Version 5.00

; Désactiver Core Isolation (Memory Integrity)
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\\Scenarios\\HypervisorEnforcedCodeIntegrity]
"Enabled"=dword:00000000

[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard]
"EnableVirtualizationBasedSecurity"=dword:00000000
"RequirePlatformSecurityFeatures"=dword:00000000

; Redémarrage requis`,
      requiresAdmin: true,
    },
    {
      name: 'Registre GPU Priority & SFIO',
      description: 'Configure les priorités GPU Tasks/Games et SFIO/Scheduling pour le gaming',
      category: 'REGISTRY_TWEAKS',
      content: `Windows Registry Editor Version 5.00

; GPU Priority pour Tasks (Bureau) = 8
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers\\Scheduler\\Tasks]
"GPU Priority"=dword:00000008
"GPU Priority Boost"=dword:00000001

; GPU Priority pour Games = 6 (plus haute priorité que bureau)
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers\\Scheduler\\Games]
"GPU Priority"=dword:00000006
"GPU Priority Boost"=dword:00000001

; High SFIO Priority
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl]
"HighSFIOPriority"=dword:00000001
"Win32PrioritySeparation"=dword:00000026

; Menu Show Delay = 0
[HKEY_CURRENT_USER\\Control Panel\\Desktop]
"MenuShowDelay"="0"

; Redémarrage requis`,
      requiresAdmin: true,
    },
    {
      name: 'Debloat Windows & Télémétrie',
      description: 'Supprime applications préinstallées, désactive télémétrie et services inutiles',
      category: 'DEBLOAT',
      content: `@echo off
title FMX - Debloat Windows & Telemetrie
echo === DEBLOAT WINDOWS ===

echo [1/5] Suppression applications preinstallees...
powershell -Command "Get-AppxPackage *3dbuilder* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *bing* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *zune* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *xbox* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *maps* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *alarms* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *camera* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *getstarted* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *officehub* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *people* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *skype* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *solitaires* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *soundrecorder* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *wallet* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *weather* | Remove-AppxPackage"
powershell -Command "Get-AppxPackage *yourphone* | Remove-AppxPackage"

echo [2/5] Désactivation Telemetrie...
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f

echo [3/5] Désactivation services inutiles...
sc config "DiagTrack" start= disabled 2>nul
sc config "WSearch" start= disabled 2>nul
sc config "SysMain" start= disabled 2>nul
sc config "PrintNotify" start= disabled 2>nul
sc config "Fax" start= disabled 2>nul

echo [4/5] Désactivation tâches planifiées télémétrie...
schtasks /change /tn "\\Microsoft\\Windows\\Application Experience\\Microsoft Compatibility Appraiser" /disable 2>nul
schtasks /change /tn "\\Microsoft\\Windows\\Application Experience\\ProgramDataUpdater" /disable 2>nul
schtasks /change /tn "\\Microsoft\\Windows\\Customer Experience Improvement Program\\Consolidator" /disable 2>nul
schtasks /change /tn "\\Microsoft\\Windows\\Customer Experience Improvement Program\\KernelCeipTask" /disable 2>nul
schtasks /change /tn "\\Microsoft\\Windows\\Customer Experience Improvement Program\\UsbCeip" /disable 2>nul

echo [5/5] Nettoyage...
echo Termine. Redemarrage recommande.
pause`,
      requiresAdmin: true,
    },
    {
      name: 'Activer MSI GPU',
      description: 'Active Message Signaled Interrupts sur la carte graphique via MSI Utility',
      category: 'GPU_OPTIMIZATION',
      content: `@echo off
title FMX - Activer MSI GPU
echo === ACTIVATION MSI GPU ===

echo.
echo CE SCRIPT REQUIERT MSI UTILITY v3 (https://github.com/MSI-Utility/MSI-Utility)
echo.
echo ETAPES MANUELLES:
echo 1. Telechargez MSI Utility v3
echo 2. Lancez en Administrateur
echo 3. Onglet "GPU" > Cochez "MSI Mode" 
echo 4. Priorité: High
echo 5. Cliquez "Apply"
echo.
echo ALTERNATIVE POWERSHELL (si pilote supporte):
powershell -Command "
  \$gpu = Get-PnpDevice -Class 'Display' -Status 'OK' | Where-Object { \$_.FriendlyName -like '*NVIDIA*' -or \$_.FriendlyName -like '*AMD*' }
  foreach (\$dev in \$gpu) {
    \$path = \$dev.InstanceId
    \$regPath = 'HKLM:\SYSTEM\CurrentControlSet\Enum\' + \$path + '\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties'
    if (Test-Path \$regPath) {
      Set-ItemProperty -Path \$regPath -Name 'MSISupported' -Value 1 -Force
      Write-Host 'MSI activé pour:' \$dev.FriendlyName
    }
  }
"

echo.
echo Verification: Gestionnaire peripheriques > Carte graphique > Proprietes > Ressources
echo Doit afficher "Message Signaled Interrupts" au lieu de "IRQ"
pause`,
      requiresAdmin: true,
    },
    {
      name: 'DNS Cloudflare 1.1.1.1',
      description: 'Configure les DNS Cloudflare avec DoH (DNS over HTTPS)',
      category: 'NETWORK_OPTIMIZATION',
      content: `@echo off
title FMX - DNS Cloudflare 1.1.1.1
echo === CONFIGURATION DNS CLOUDFLARE ===

echo Interface reseau active:
netsh interface show interface | findstr "Activé"

echo.
echo Application DNS Cloudflare...
netsh interface ip set dns "Ethernet" static 1.1.1.1 primary validate=no
netsh interface ip add dns "Ethernet" 1.0.0.1 index=2 validate=no

echo.
echo Activation DNS over HTTPS (DoH)...
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters" /v "EnableAutoDoh" /t REG_DWORD /d 1 /f
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters" /v "DohTemplate" /t REG_SZ /d "https://cloudflare-dns.com/dns-query" /f

echo.
echo Purge cache DNS...
ipconfig /flushdns

echo.
echo Test resolution...
nslookup google.com 1.1.1.1

pause`,
      requiresAdmin: true,
    },
    {
      name: 'Purge DNS / Winsock / IP Complète',
      description: 'Réinitialise complètement la pile réseau Windows',
      category: 'NETWORK_OPTIMIZATION',
      content: `@echo off
title FMX - Purge Reseau Complete
echo === PURGE RESEAU COMPLETE ===

echo [1/5] Purge Cache DNS...
ipconfig /flushdns

echo [2/5] Purge Cache ARP...
arp -d *

echo [3/5] Reset Winsock...
netsh winsock reset

echo [4/5] Reset TCP/IP...
netsh int ip reset

echo [5/5] Reset Firewall (optionnel)...
netsh advfirewall reset

echo.
echo === RESEAU REINITIALISE ===
echo RED�?MARRAGE REQUIS pour prise en compte complete.
pause`,
      requiresAdmin: true,
    },
    {
      name: 'QoS Gaming & TCP/IP Optimisation',
      description: 'Configure QoS pour prioriser le trafic gaming et optimise les paramètres TCP/IP',
      category: 'NETWORK_OPTIMIZATION',
      content: `@echo off
title FMX - QoS Gaming & TCP/IP Optimisation
echo === QOS GAMING & TCPIP OPTIMISATION ===

echo [1/4] Désactivation Algorithme Nagle (TcpAckFrequency=1)...
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\*" /v "TcpAckFrequency" /t REG_DWORD /d 1 /f 2>nul

echo [2/4] TCP Window Scaling...
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v "WindowSize" /t REG_DWORD /d 65535 /f
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v "TcpWindowSize" /t REG_DWORD /d 65535 /f
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v "GlobalMaxTcpWindowSize" /t REG_DWORD /d 65535 /f

echo [3/4] MTU Optimisé (1472 pour Ethernet standard)...
netsh interface ipv4 set subinterface "Ethernet" mtu=1472 store=persistent

echo [4/4] QoS Gaming - Priorité paquets jeux...
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\QoS" /v "NonBestEffortLimit" /t REG_DWORD /d 0 /f

echo.
echo Redemarrage requis pour prise en compte.
pause`,
      requiresAdmin: true,
    },
    {
      name: 'Désactiver Optimisations Plein �?cran (Tous Jeux)',
      description: 'Désactive FSO (Fullscreen Optimizations) pour tous les exécutables de jeux détectés',
      category: 'GAME_SPECIFIC',
      content: `@echo off
title FMX - Desactiver FSO Tous Jeux
echo === DESACTIVATION FULLSCREEN OPTIMIZATIONS ===

echo Recherche executables jeux...
set GAME_PATHS=
set GAME_PATHS=%GAME_PATHS% "C:\Program Files\Epic Games\Fortnite\FortniteGame\Binaries\Win64\FortniteClient-Win64-Shipping.exe"
set GAME_PATHS=%GAME_PATHS% "C:\Program Files (x86)\Steam\steamapps\common\VALORANT\live\VALORANT.exe"
set GAME_PATHS=%GAME_PATHS% "C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\bin\win64\cs2.exe"
set GAME_PATHS=%GAME_PATHS% "C:\Program Files (x86)\Steam\steamapps\common\Apex Legends\r5apex.exe"
set GAME_PATHS=%GAME_PATHS% "C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Modern Warfare\ModernWarfare.exe"
set GAME_PATHS=%GAME_PATHS% "C:\Program Files (x86)\Steam\steamapps\common\Warzone\ModernWarfare.exe"

for %%G in (%GAME_PATHS%) do (
  if exist "%%G" (
    echo Application FSO Disable: %%G
    reg add "HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" /v "%%G" /t REG_SZ /d "~DPIUNAWARE ~FULLSCREENOPTIMIZATIONS" /f
  )
)

echo.
echo Pour ajouter d'autres jeux, modifiez ce script ou utilisez:
echo Clic droit .exe > Proprietes > Compatibilite > Desactiver optimisations plein ecran

pause`,
      requiresAdmin: false,
    },
    {
      name: 'Configuration ParkControl (Bitsum Highest Performance)',
      description: 'Fichier de configuration ParkControl pour désactiver Core Parking',
      category: 'POWER_MANAGEMENT',
      content: `[ParkControl]
Profile=Bitsum Highest Performance
CoreParking=Disabled
FrequencyScaling=Disabled
PerformanceMode=1
IdleDemotion=Disabled
IdlePromotion=Disabled
BusyThreshold=0
`,
      requiresAdmin: false,
    },
    {
      name: 'Configuration Process Lasso Pro',
      description: 'Configuration Process Lasso pour priorité �?levée, E/S Haute, exclusion ProBalance',
      category: 'SYSTEM_CLEANUP',
      content: `[ProcessLasso]
AutoStart=1
ManageAllProcesses=1
DefaultPriorityClass=High
DefaultIoPriority=High
ProBalanceExclude=1
ProBalanceExcludeList=FortniteClient-Win64-Shipping.exe;VALORANT.exe;cs2.exe;r5apex.exe;ModernWarfare.exe
KeepProcessesRunning=1
RestartIfTerminated=1
SmartTrim=1
SmartTrimThreshold=80
`,
      requiresAdmin: false,
    },
    {
      name: 'Configuration ISLC (Timer Resolution 0.5ms)',
      description: 'Configuration ISLC pour Timer Resolution 0.5ms et seuils RAM optimisés',
      category: 'TIMER_RESOLUTION',
      content: `[ISLC]
TimerResolution=0.5
AutoStart=1
MinimizeToTray=1
ClearStandbyList=1
StandbyThresholdMB=1024
CustomTimerResolution=1
LogEvents=0
CheckInterval=1000
`,
      requiresAdmin: true,
    },
    {
      name: 'Désactiver Green Ethernet',
      description: 'Désactive l\'économie d\'énergie (Green Ethernet) sur la carte réseau',
      category: 'NETWORK_OPTIMIZATION',
      content: `@echo off
title FMX - Desactiver Green Ethernet
echo === DESACTIVATION GREEN ETHERNET ===

powershell -Command "
  \$adapters = Get-NetAdapter | Where-Object { \$_.Status -eq 'Up' -and \$_.PhysicalMediaType -eq '802.3' }
  foreach (\$adapter in \$adapters) {
    \$name = \$adapter.Name
    Write-Host 'Configuration:' \$name
    
    # Désactiver Green Ethernet
    Set-NetAdapterPowerManagement -Name \$name -EnableGreenEthernet \$false -ErrorAction SilentlyContinue
    
    # Désactiver ARP Offload, NS Offload
    Set-NetAdapterAdvancedProperty -Name \$name -DisplayName 'ARP Offload' -DisplayValue 'Disabled' -ErrorAction SilentlyContinue
    Set-NetAdapterAdvancedProperty -Name \$name -DisplayName 'NS Offload' -DisplayValue 'Disabled' -ErrorAction SilentlyContinue
    
    Write-Host '  Green Ethernet: DESACTIVE'
  }
"

echo.
echo Verification: Get-NetAdapterPowerManagement | Format-Table Name, GreenEthernet
pause`,
      requiresAdmin: true,
    },
    {
      name: 'Forcer Speed & Duplex 1Gbps',
      description: 'Force la vitesse et le duplex de la carte réseau à 1Gbps Full Duplex',
      category: 'NETWORK_OPTIMIZATION',
      content: `@echo off
title FMX - Forcer Speed Duplex 1Gbps
echo === FORCER SPEED & DUPLEX 1GBPS ===

powershell -Command "
  \$adapters = Get-NetAdapter | Where-Object { \$_.Status -eq 'Up' -and \$_.PhysicalMediaType -eq '802.3' }
  foreach (\$adapter in \$adapters) {
    \$name = \$adapter.Name
    Write-Host 'Configuration:' \$name
    
    Set-NetAdapterAdvancedProperty -Name \$name -DisplayName 'Speed & Duplex' -DisplayValue '1.0 Gbps Full Duplex' -ErrorAction SilentlyContinue
    
    Write-Host '  Speed & Duplex: 1.0 Gbps Full Duplex'
  }
"

echo.
echo Verification: Get-NetAdapterAdvancedProperty -Name 'Ethernet' -DisplayName 'Speed & Duplex'
pause`,
      requiresAdmin: true,
    },
    {
      name: 'Configuration NVIDIA Profile (Faible Latence Ultra, Perfs Max)',
      description: 'Profil NVIDIA Inspector pour paramètres gaming optimaux',
      category: 'GPU_OPTIMIZATION',
      content: `; NVIDIA Profile Inspector Export
; Appliquez via NVIDIA Profile Inspector > Import Profile

[Profile]
Name=FMX Gaming Optimized
BaseProfile=Base Profile

[Settings]
PowerMizerLevel=0x1
PowerMizerLevelAC=0x1
LowLatencyMode=0x2
ThreadedOptimization=0x1
TextureFilteringQuality=0x1
ShaderCache=0x1
VerticalSync=0x0
TextureFilteringAnisotropicSampleOptimization=0x1
TextureFilteringNegativeLODBias=0x1
TextureFilteringTrilinearOptimization=0x1
`,
      requiresAdmin: false,
    },
  ]

  for (const script of scripts) {
    await prisma.optimizationScript.upsert({
      where: { id: `script-${script.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `script-${script.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...script,
        version: '1.0.0',
        isActive: true,
        downloadCount: Math.floor(Math.random() * 5000) + 500,
      },
    })
  }
  console.log(`�o. ${scripts.length} optimization scripts created`)

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'FMX Optimisation',
      siteDescription: 'L\'optimisation PC ultime pour gamers exigeants. FPS Maximaux & Latence Zéro.',
      maintenanceMode: false,
      registrationOpen: true,
      defaultPackage: 'BASIC',
      supportEmail: 'support@fmx-optimisation.com',
      discordUrl: 'https://discord.gg/fmx',
      telegramUrl: 'https://t.me/fmxopt',
    },
  })
  console.log('�o. Site settings created')

  // Create demo license for demo user
  await prisma.license.upsert({
    where: { key: 'FMX-PRO-DEMO123456789' },
    update: {},
    create: {
      key: 'FMX-PRO-DEMO123456789',
      userId: demo.id,
      packageType: 'PRO',
      status: 'ACTIVE',
      activatedAt: new Date(),
    },
  })

  // Create demo order
  await prisma.order.upsert({
    where: { orderNumber: 'FMX-DEMO-ORDER-001' },
    update: {},
    create: {
      orderNumber: 'FMX-DEMO-ORDER-001',
      userId: demo.id,
      packageType: 'PRO',
      amount: 59,
      currency: 'EUR',
      status: 'COMPLETED',
      paymentMethod: 'MANUAL',
      licenseKey: 'FMX-PRO-DEMO123456789',
      paidAt: new Date(),
      completedAt: new Date(),
    },
  })
  console.log('�o. Demo license & order created')

  console.log('�YZ? Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('�O Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
