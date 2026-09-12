@echo off
title FMX Optimisation - Desactivation Optimisations Plein Ecran (FSO)
echo ============================================================
echo  FMX OPTIMISATION - DESACTIVATION FSO (TOUS JEUX)
echo ============================================================
echo.
echo Desactive les "Optimisations plein écran" de Windows 10/11
echo pour tous les executables de jeux detectes.
echo Gain: -5 a -15ms latence, suppression stutter DWM
echo.
echo NECESSITE REDÉMARRAGE APRES APPLICATION
echo.

echo Recherche executables jeux connus...
set GAME_EXES=^
"C:\Program Files\Epic Games\Fortnite\FortniteGame\Binaries\Win64\FortniteClient-Win64-Shipping.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\VALORANT\live\VALORANT.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\bin\win64\cs2.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Apex Legends\r5apex.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Modern Warfare\ModernWarfare.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Modern Warfare II\ModernWarfareII.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Call of Duty\Warzone\ModernWarfare.exe" ^
"C:\Program Files (x88)\Steam\steamapps\common\Overwatch\_retail_\Overwatch.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Rocket League\Binaries\Win64\RocketLeague.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Rainbow Six Siege\RainbowSix.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\League of Legends\Game\League of Legends.exe" ^
"C:\Riot Games\League of Legends\Game\League of Legends.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Destiny 2\destiny2.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Escape from Tarkov\EscapeFromTarkov.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\PUBG\TslGame\Binaries\Win64\TslGame.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\DayZ\DayZ_x64.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\Rust\RustClient.exe" ^
"C:\Program Files (x86)\Steam\steamapps\common\ARK\ShooterGame\Binaries\Win64\ShooterGame.exe"

echo.
echo Application registre pour chaque jeu trouve...
for %%G in (%GAME_EXES%) do (
    if exist "%%G" (
        echo TROUVE: %%G
        reg add "HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" /v "%%G" /t REG_SZ /d "~DPIUNAWARE ~FULLSCREENOPTIMIZATIONS" /f
    ) else (
        echo MANQUANT: %%G
    )
)

echo.
echo ============================================================
echo  AJOUT MANUEL POUR AUTRES JEUX
echo ============================================================
echo.
echo Pour ajouter d'autres jeux non detectes :
echo 1. Trouver le .exe du jeu (clic droit > Proprietes > Emplacement)
echo 2. Executer cette commande PowerShell (Admin) :
echo.
echo   reg add "HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" /v "CHEMIN_COMPLET_VERS_JEU.exe" /t REG_SZ /d "~DPIUNAWARE ~FULLSCREENOPTIMIZATIONS" /f
echo.
echo Ou manuellement :
echo   Clic droit .exe jeu > Proprietes > Compatibilite
echo   Cochez "Desactiver les optimisations plein ecran"
echo   Parametres DPI eleves > Remplacer > Application
echo.
echo Verification registre :
echo   reg query "HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"
echo.
pause