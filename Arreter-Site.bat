@echo off
title FMX - Arreter le site
echo Arret du serveur FMX...
taskkill /F /IM node.exe >nul 2>&1
echo Site arrete.
timeout /t 2 /nobreak >nul
