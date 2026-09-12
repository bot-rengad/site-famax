@echo off
title FMX Optimisation - Verification Integrite Fichiers Systeme (SFC/DISM)
echo ============================================================
echo  FMX OPTIMISATION - SFC / DISM REPAIR
echo ============================================================
echo.
echo Repare les fichiers systeme Windows corrompus et l'image
echo du composant Windows (WinSxS). A executer avant toute
echo optimisation majeure.
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.
echo DUREE ESTIMEE: 5-15 minutes selon disque
echo.

echo ============================================================
echo  [1/3] DISM - Restauration image Windows (WinSxS)
echo ============================================================
echo Telecharge fichiers sains via Windows Update si necessaire...
echo.
DISM /Online /Cleanup-Image /RestoreHealth

if %errorlevel% neq 0 (
    echo.
    echo [AVERTISSEMENT] DISM a rencontre des erreurs
    echo Tentative avec source locale...
    echo.
    DISM /Online /Cleanup-Image /RestoreHealth /Source:wim:C:\Windows\WinSxS /LimitAccess
)

echo.
echo ============================================================
echo  [2/3] SFC - Verification fichiers systeme proteges
echo ============================================================
echo Verification et reparation fichiers corrompus...
echo.
sfc /scannow

echo.
echo ============================================================
echo  [3/3] VERIFICATION RESULTATS
echo ============================================================
echo.
echo RESULTATS SFC :
findstr /c:"[SR]" %windir%\Logs\CBS\CBS.log > "%TEMP%\sfcdetails.txt" 2>nul
type "%TEMP%\sfcdetails.txt" 2>nul

echo.
echo ============================================================
echo  REPARATION TERMINEE
echo ============================================================
echo.
echo REDÉMARRAGE RECOMMANDE avant de continuer les optimisations.
echo.
echo Si erreurs persistent :
echo   1. Redemarrer en Mode Sans Echec
echo   2. Relancer ce script
echo   3. Ou: DISM /Online /Cleanup-Image /RestoreHealth /Source:wim:X:\sources\install.wim:1 /LimitAccess
echo      (X = lecteur installation Windows)
echo.
pause