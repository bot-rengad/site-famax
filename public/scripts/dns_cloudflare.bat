@echo off
title FMX Optimisation - DNS Cloudflare 1.1.1.1 + DoH
echo ============================================================
echo  FMX OPTIMISATION - DNS CLOUDFLARE 1.1.1.1 + DOH
echo ============================================================
echo.
echo Configure les DNS Cloudflare avec DNS over HTTPS (DoH)
echo pour confidentialite, vitesse et securite.
echo Gain: -5 a -15ms resolution DNS, anti-tracking
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.

echo [1/3] Configuration DNS IPv4 Cloudflare...
netsh interface ip set dns "Ethernet" static 1.1.1.1 primary validate=no
netsh interface ip add dns "Ethernet" 1.0.0.1 index=2 validate=no

echo.
echo [2/3] Configuration DNS IPv6 Cloudflare...
netsh interface ipv6 set dns "Ethernet" static 2606:4700:4700::1111 primary validate=no
netsh interface ipv6 add dns "Ethernet" 2606:4700:4700::1001 index=2 validate=no

echo.
echo [3/3] Activation DNS over HTTPS (DoH) Cloudflare...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v "EnableAutoDoh" /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v "DohTemplate" /t REG_SZ /d "https://cloudflare-dns.com/dns-query" /f

echo.
echo Purge cache DNS...
ipconfig /flushdns

echo.
echo ============================================================
echo  DNS CLOUDFLARE CONFIGURE
echo ============================================================
echo.
echo Test resolution:
nslookup google.com 1.1.1.1

echo.
echo Verification DoH:
echo   Get-DnsClientGlobalSetting | Select-Object EnableAutoDoh, DohTemplate
echo.
pause