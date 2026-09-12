@echo off
title FMX - Installation du projet
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   FMX OPTIMISATION - Installation Complete
echo ============================================
echo.

:: Verifier Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe !
    echo Telecharge-le sur : https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js detecte : %NODE_VER%

:: Verifier npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installe !
    pause
    exit /b 1
)

echo.
echo --- Etape 1/6 : Installation des dependances ---
echo.
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de l'installation des dependances
    pause
    exit /b 1
)
echo [OK] Dependances installees

echo.
echo --- Etape 2/6 : Configuration de l'environnement ---
echo.
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Fichier .env cree depuis .env.example
        echo [INFO] Modifie le fichier .env avec tes propres valeurs si besoin
    ) else (
        echo [AVERTISSEMENT] Aucun fichier .env.example trouve
    )
) else (
    echo [OK] Fichier .env deja present
)

echo.
echo --- Etape 3/6 : Generation du client Prisma ---
echo.
call npm run db:generate
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de la generation Prisma
    pause
    exit /b 1
)
echo [OK] Client Prisma genere

echo.
echo --- Etape 4/6 : Creation de la base de donnees ---
echo.
call npm run db:push
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de la creation de la base
    pause
    exit /b 1
)
echo [OK] Base de donnees creee

echo.
echo --- Etape 5/6 : Peuplement avec les donnees de demo ---
echo.
call npm run db:seed
if %errorlevel% neq 0 (
    echo [ERREUR] Echec du seeding
    pause
    exit /b 1
)
echo [OK] Donnees de demo inserees

echo.
echo --- Etape 6/6 : Verification du build ---
echo.
call npm run build
if %errorlevel% neq 0 (
    echo [ERREUR] Echec du build
    pause
    exit /b 1
)
echo [OK] Build reussi

echo.
echo ============================================
echo   INSTALLATION TERMINEE AVEC SUCCES !
echo ============================================
echo.
echo Comptes de demo :
echo   Admin  : admin@fmx-optimisation.com / admin123
echo   Client : demo@fmx-optimisation.com / demo1234
echo.
echo Pour lancer le site :
echo   Double-clique sur "Demarrer-Site.bat"
echo   Ou tape : npm run dev
echo.
echo Le site sera accessible sur : http://localhost:3000
echo.
pause
