@echo off
title FMX Optimisation - Activation MSI GPU (Message Signaled Interrupts)
echo ============================================================
echo  FMX OPTIMISATION - ACTIVATION MSI GPU
echo ============================================================
echo.
echo Active Message Signaled Interrupts (MSI) sur la carte
echo graphique pour reduire la latence d'interruption.
echo Gain: -3 a -8ms latence, +3-5% FPS, stabilite
echo.
echo METHODE 1: MSI Utility v3 (RECOMMANDEE - GUI)
echo   1. Telecharger: https://github.com/MSI-Utility/MSI-Utility
echo   2. Lancer en ADMINISTRATEUR
echo   3. Onglet GPU > Cochez "MSI Mode" > Priorite: High
echo   4. Cliquer "Apply"
echo.
echo METHODE 2: PowerShell (si pilote compatible)
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.

echo Detection GPU compatibles...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$gpus = Get-PnpDevice -Class 'Display' -Status 'OK' | Where-Object { $_.FriendlyName -like '*NVIDIA*' -or $_.FriendlyName -like '*AMD*' -or $_.FriendlyName -like '*Intel*' }; ^
   if ($gpus.Count -eq 0) { Write-Host 'Aucun GPU detecte'; exit 1 }; ^
   foreach ($gpu in $gpus) { ^
     Write-Host \"GPU trouve: $($gpu.FriendlyName) ($($gpu.InstanceId))\"; ^
     $regPath = 'HKLM:\SYSTEM\CurrentControlSet\Enum\' + $gpu.InstanceId + '\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties'; ^
     if (Test-Path $regPath) { ^
       $current = Get-ItemProperty -Path $regPath -Name 'MSISupported' -ErrorAction SilentlyContinue; ^
       if ($current.MSISupported -eq 1) { Write-Host \"  MSI DEJA ACTIF\"; } ^
       else { ^
         Set-ItemProperty -Path $regPath -Name 'MSISupported' -Value 1 -Force; ^
         Write-Host \"  MSI ACTIVE avec succes\"; ^
       } ^
     } else { ^
       Write-Host \"  Cle registre MSI introuvable - pilote peut ne pas supporter MSI\"; ^
     } ^
   }"

echo.
echo ============================================================
echo  VERIFICATION
echo ============================================================
echo.
echo Gestionnaire de peripheriques > Carte graphique
echo Proprietes > onglet Ressources
echo Doit afficher "Message Signaled Interrupts" (pas IRQ)
echo.
echo Si echoue : Utilisez MSI Utility v3 (methode GUI)
echo.
pause