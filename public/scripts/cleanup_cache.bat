@echo off
title FMX Optimisation - Nettoyage Cache Systeme Complet
echo ============================================================
echo  FMX OPTIMISATION - NETTOYAGE CACHE COMPLET
echo ============================================================
echo.
echo Ce script nettoie tous les caches Windows, fichiers
echo temporaires, prefetch, logs evenements, etc.
echo.
echo EXECUTION EN MODE ADMINISTRATEUR RECOMMANDEE
echo.

echo [1/7] Nettoyage fichiers temporaires utilisateur...
del /q /f /s "%TEMP%\*" 2>nul
for /d %%p in ("%TEMP%\*") do rmdir /s /q "%%p" 2>nul

echo [2/7] Nettoyage fichiers temporaires Windows...
del /q /f /s "C:\Windows\Temp\*" 2>nul
for /d %%p in ("C:\Windows\Temp\*") do rmdir /s /q "%%p" 2>nul

echo [3/7] Nettoyage Prefetch (ameliore temps demarrage)... 
del /q /f /s "C:\Windows\Prefetch\*" 2>nul

echo [4/7] Nettoyage Cache Windows Update...
net stop wuauserv 2>nul
del /q /f /s "C:\Windows\SoftwareDistribution\Download\*" 2>nul
net start wuauserv 2>nul

echo [5/7] Nettoyage Cache DNS...
ipconfig /flushdns

echo [6/7] Nettoyage Corbeille...
powershell -NoProfile -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"

echo [7/7] Nettoyage Journaux evenements (System, Application)...
wevtutil cl System 2>nul
wevtutil cl Application 2>nul
wevtutil cl Security 2>nul

echo.
echo ============================================================
echo  NETTOYAGE TERMINE AVEC SUCCES
echo ============================================================
echo.
echo Espace disque recupere. Redemarrage recommande.
echo.
pause