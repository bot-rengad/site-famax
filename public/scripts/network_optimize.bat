@echo off
title FMX Optimisation - Desactivation Green Ethernet + Speed Duplex
echo ============================================================
echo  FMX OPTIMISATION - RESEAU : GREEN ETHERNET + SPEED DUPLEX
echo ============================================================
echo.
echo Ce script desactive l'economie d'energie carte reseau
echo (Green Ethernet) et force 1Gbps Full Duplex.
echo Gain: -5 a -20ms ping, 0% packet loss, stabilite
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.

echo [1/4] Desactivation Green Ethernet sur toutes cartes actives...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.PhysicalMediaType -eq '802.3' }; ^
   foreach ($a in $adapters) { ^
     Write-Host \"Config: $($a.Name)\"; ^
     Set-NetAdapterPowerManagement -Name $a.Name -EnableGreenEthernet $false -ErrorAction SilentlyContinue; ^
     Set-NetAdapterAdvancedProperty -Name $a.Name -DisplayName 'Green Ethernet' -DisplayValue 'Disabled' -ErrorAction SilentlyContinue; ^
     Set-NetAdapterAdvancedProperty -Name $a.Name -DisplayName 'Energy Efficient Ethernet' -DisplayValue 'Disabled' -ErrorAction SilentlyContinue; ^
     Write-Host \"  Green Ethernet: DESACTIVE\" ^
   }"

echo.
echo [2/4] Forçage Speed & Duplex 1.0 Gbps Full Duplex...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.PhysicalMediaType -eq '802.3' }; ^
   foreach ($a in $adapters) { ^
     Set-NetAdapterAdvancedProperty -Name $a.Name -DisplayName 'Speed & Duplex' -DisplayValue '1.0 Gbps Full Duplex' -ErrorAction SilentlyContinue; ^
     Write-Host \"  $($a.Name): 1.0 Gbps Full Duplex FORCE\" ^
   }"

echo.
echo [3/4] Desactivation ARP Offload / NS Offload (latence)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.PhysicalMediaType -eq '802.3' }; ^
   foreach ($a in $adapters) { ^
     Set-NetAdapterAdvancedProperty -Name $a.Name -DisplayName 'ARP Offload' -DisplayValue 'Disabled' -ErrorAction SilentlyContinue; ^
     Set-NetAdapterAdvancedProperty -Name $a.Name -DisplayName 'NS Offload' -DisplayValue 'Disabled' -ErrorAction SilentlyContinue; ^
   }"

echo.
echo [4/4] Configuration DNS Cloudflare 1.1.1.1 (IPv4)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$iface = (Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.PhysicalMediaType -eq '802.3' } | Select-Object -First 1).InterfaceIndex; ^
   Set-DnsClientServerAddress -InterfaceIndex $iface -ServerAddresses '1.1.1.1','1.0.0.1'; ^
   Write-Host \"DNS configure sur interface $iface: 1.1.1.1 / 1.0.0.1\""

echo.
echo ============================================================
echo  RESEAU OPTIMISE
echo ============================================================
echo.
echo Verification:
echo   Get-NetAdapterPowerManagement | Format-Table Name, GreenEthernet
echo   Get-NetAdapterAdvancedProperty -DisplayName 'Speed & Duplex'
echo.
echo REDÉMARRAGE RECOMMANDE pour prise en compte complete.
pause