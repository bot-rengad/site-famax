@echo off
title FMX Optimisation - Timer Resolution 0.5ms
echo ============================================================
echo  FMX OPTIMISATION - TIMER RESOLUTION 0.5ms
echo ============================================================
echo.
echo Ce script force la resolution du timer systeme a 0.5ms
echo pour reduire la latence systeme (input lag, stutter).
echo.
echo NOTE: Pour un effet permanent, utilisez ISLC (Intelligent
echo Standby List Cleaner) avec Timer Resolution = 0.5ms.
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.

echo Verification resolution actuelle...
w32tm /query /status | findstr /i "Resolution"

echo.
echo Application Timer Resolution 0.5ms via powercfg...

powercfg /setacvalueindex scheme_current sub_processor PERFBOOSTMODE 1
powercfg /setdcvalueindex scheme_current sub_processor PERFBOOSTMODE 1
powercfg /setactive scheme_current

echo.
echo Desactivation Core Parking (stationnement coeurs)...
powercfg /setacvalueindex scheme_current sub_processor CPMINCORES 0
powercfg /setacvalueindex scheme_current sub_processor CPMAXCORES 100
powercfg /setdcvalueindex scheme_current sub_processor CPMINCORES 0
powercfg /setdcvalueindex scheme_current sub_processor CPMAXCORES 100

echo.
echo Configuration plan "Performance Ultimate"...
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 2>nul
for /f "tokens=3" %%i in ('powercfg /list ^| findstr "Ultimate"') do (
    powercfg /setactive %%i
    echo Plan Performance Ultimate active: %%i
)

echo.
echo ============================================================
echo  CONFIGURATION APPLIQUEE
echo ============================================================
echo.
echo Pour verification : powercfg /query SCHEME_CURRENT sub_processor
echo.
echo RECOMMANDATION: Installez ISLC pour maintenir 0.5ms en permanence
echo https://www.techpowerup.com/download/techpowerup-islc/
echo.
pause