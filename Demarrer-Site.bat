@echo off
title FMX - Demarrage du site
set PATH=C:\Program Files\nodejs;%PATH%
echo ============================================
echo   FMX OPTIMISATION - Demarrage du serveur
echo ============================================
echo.
cd /d "%~dp0"
start "" http://localhost:3000
npm start
echo.
echo Le site tourne sur http://localhost:3000
echo (ferme cette fenetre ou appuie sur Ctrl+C pour arreter)
pause >nul