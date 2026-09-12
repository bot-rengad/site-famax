@echo off
title FMX Optimisation - Purge Reseau Complete (DNS/Winsock/IP/ARP)
echo ============================================================
echo  FMX OPTIMISATION - PURGE RESEAU COMPLETE
echo ============================================================
echo.
echo Reinitialise completement la pile reseau Windows.
echo Resout: DNS corrompu, connexions bloquées, IP conflict,
echo latence anormale, packet loss apres changement reseau.
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.
echo ATTENTION: Coupe temporairement la connexion internet !
echo.

echo [1/6] Purge Cache DNS local...
ipconfig /flushdns
echo   Cache DNS vide.

echo.
echo [2/6] Purge Cache ARP (table adresses MAC)...
arp -d *
echo   Table ARP vide.

echo.
echo [3/6] Reset Winsock (catalogue fournisseurs services reseau)...
netsh winsock reset
echo   Catalogue Winsock reinitialise.

echo.
echo [4/6] Reset TCP/IP (pile protocole IP)...
netsh int ip reset
echo   Pile TCP/IP reinitialisee.

echo.
echo [5/6] Reset Firewall Windows (optionnel - par defaut non)...
echo Voulez-vous reinitialiser le pare-feu Windows ? (o/N)
set /p choice=
if /i "%choice%"=="o" (
    netsh advfirewall reset
    echo   Pare-feu reinitialise.
) else (
    echo   Pare-feu conserve.
)

echo.
echo [6/6] Renouvellement bail DHCP (nouvelle IP)...
ipconfig /release
ipconfig /renew
echo   Bail DHCP renouvele.

echo.
echo ============================================================
echo  PURGE RESEAU TERMINEE
echo ============================================================
echo.
echo REDÉMARRAGE FORTEMENT RECOMMANDE pour prise en compte complete.
echo.
echo Apres redemarrage, verifier :
echo   - Connexion internet fonctionnelle
echo   - Ping stable: ping 1.1.1.1 -t
echo   - DNS: nslookup google.com 1.1.1.1
echo.
pause