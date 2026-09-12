@echo off
title FMX Optimisation - Creation Point de Restauration Systeme
echo ============================================================
echo  FMX OPTIMISATION - POINT DE RESTAURATION
echo ============================================================
echo.
echo Ce script cree un point de restauration Windows avant
echo toute optimisation majeure. En cas de probleme, vous
echo pourrez revenir a cet etat.
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Checkpoint-Computer -Description 'FMX Pre-Optimisation %DATE% %TIME%' -RestorePointType 'MODIFY_SETTINGS'"

if %errorlevel% equ 0 (
    echo.
    echo [SUCCES] Point de restauration cree avec succes !
    echo.
    echo Pour l'utiliser plus tard :
    echo 1. Windows + R -> rstrui
    echo 2. Choisir "FMX Pre-Optimisation"
    echo 3. Suivre l'assistant
) else (
    echo.
    echo [ERREUR] Echec de la creation du point de restauration
    echo Verifiez que la Protection du systeme est activee :
    echo Windows + R -> sysdm.cpl -> onglet Protection du systeme
)

echo.
echo ============================================================
pause