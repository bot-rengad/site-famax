@echo off
title FMX Optimisation - Debloat Windows + Desactivation Telemetrie
echo ============================================================
echo  FMX OPTIMISATION - DEBLOAT WINDOWS & TELEMETRIE
echo ============================================================
echo.
echo Supprime applications preinstallees inutiles, desactive
echo telemetrie, services et taches planifiees espionnes.
echo Gain: Ressources liberees, vie privee, demarrage plus rapide
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.
echo ATTENTION: Supprime definitivement apps Windows (Xbox, Maps, etc.)
echo Creer un point de restauration AVANT execution (script restore_point.bat)
echo.

echo.
echo ============================================================
echo  [1/5] SUPPRESSION APPLICATIONS PREINSTALLEES (AppX)
echo ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$apps = @( ^
    '*3dbuilder*','*bing*','*zune*','*xbox*','*maps*','*alarms*', ^
    '*camera*','*getstarted*','*officehub*','*people*','*skype*', ^
    '*solitaires*','*soundrecorder*','*wallet*','*weather*','*yourphone*', ^
    '*mixedreality*','*holographic*','*paint*','*photos*','*onenote*', ^
    '*messaging*','*phone*','*contacts*','*feedback*','*tips*', ^
    '*xboxgaming*','*xboxidentity*','*xboxspeech*','*gamebar*' ^
  ); ^
  foreach ($app in $apps) { ^
    Get-AppxPackage $app -AllUsers | Remove-AppxPackage -ErrorAction SilentlyContinue; ^
    Get-AppxProvisionedPackage -Online | Where-Object { $_.PackageName -like $app } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue; ^
  }; ^
  Write-Host 'Applications supprimees.'"

echo.
echo ============================================================
echo  [2/5] DESACTIVATION TELEMETRIE (Registre)
echo ============================================================
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v "DoNotShowFeedbackNotifications" /t REG_DWORD /d 1 /f

echo.
echo ============================================================
echo  [3/5] DESACTIVATION SERVICES INUTILES
echo ============================================================
sc config "DiagTrack" start= disabled 2>nul
sc stop "DiagTrack" 2>nul
sc config "WSearch" start= disabled 2>nul
sc stop "WSearch" 2>nul
sc config "SysMain" start= disabled 2>nul
sc stop "SysMain" 2>nul
sc config "PrintNotify" start= disabled 2>nul
sc config "Fax" start= disabled 2>nul
sc config "WpnUserService" start= disabled 2>nul
sc config "WpnService" start= disabled 2>nul
sc config "CDPUserSvc" start= disabled 2>nul
sc config "PimIndexMaintenanceSvc" start= disabled 2>nul

echo.
echo ============================================================
echo  [4/5] DESACTIVATION TACHES PLANIFIEES TELEMETRIE
echo ============================================================
schtasks /change /tn "\Microsoft\Windows\Application Experience\Microsoft Compatibility Appraiser" /disable 2>nul
schtasks /change /tn "\Microsoft\Windows\Application Experience\ProgramDataUpdater" /disable 2>nul
schtasks /change /tn "\Microsoft\Windows\Customer Experience Improvement Program\Consolidator" /disable 2>nul
schtasks /change /tn "\Microsoft\Windows\Customer Experience Improvement Program\KernelCeipTask" /disable 2>nul
schtasks /change /tn "\Microsoft\Windows\Customer Experience Improvement Program\UsbCeip" /disable 2>nul
schtasks /change /tn "\Microsoft\Windows\DiskDiagnostic\Microsoft-Windows-DiskDiagnosticDataCollector" /disable 2>nul
schtasks /change /tn "\Microsoft\Windows\Maintenance\WinSAT" /disable 2>nul
schtasks /change /tn "\Microsoft\Windows\PI\Sqm-Tasks" /disable 2>nul

echo.
echo ============================================================
echo  [5/5] NETTOYAGE FINAL
echo ============================================================
del /q /f /s "%TEMP%\*" 2>nul
del /q /f /s "C:\Windows\Temp\*" 2>nul
ipconfig /flushdns

echo.
echo ============================================================
echo  DEBLOAT TERMINE
echo ============================================================
echo.
echo REDÉMARRAGE OBLIGATOIRE pour prise en compte complete.
echo.
echo Pour restaurer apps supprimées (si besoin) :
echo   Get-AppxPackage -AllUsers | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"}
echo.
pause