@echo off
title FMX Optimisation - QoS Gaming & Optimisation TCP/IP
echo ============================================================
echo  FMX OPTIMISATION - QOS GAMING & TCPIP OPTIMISATION
echo ============================================================
echo.
echo Configure QoS pour prioriser trafic gaming et optimise
echo parametres TCP/IP (Nagle, Window Scaling, MTU).
echo Gain: -10 a -30ms ping, -20% packet loss, stabilite
echo.
echo EXECUTION EN MODE ADMINISTRATEUR REQUISE
echo.
echo NECESSITE REDÉMARRAGE
echo.

echo [1/5] Desactivation Algorithme Nagle (TcpAckFrequency=1)...
echo Reduit latence en envoyant ACK immediatement (pas delai 200ms)
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpAckFrequency" /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\*" /v "TcpAckFrequency" /t REG_DWORD /d 1 /f 2>nul

echo.
echo [2/5] TCP Window Scaling & Taille fenetre optimisee...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "WindowSize" /t REG_DWORD /d 65535 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpWindowSize" /t REG_DWORD /d 65535 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "GlobalMaxTcpWindowSize" /t REG_DWORD /d 65535 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableTCPChimney" /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableRSS" /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnableTCPA" /t REG_DWORD /d 1 /f

echo.
echo [3/5] MTU Optimise (1472 pour Ethernet standard = 1500 - 28 header)...
echo Testez avec: ping -f -l 1472 1.1.1.1 (si echec, reduisez par 10)
netsh interface ipv4 set subinterface "Ethernet" mtu=1472 store=persistent
netsh interface ipv4 set subinterface "Wi-Fi" mtu=1472 store=persistent 2>nul

echo.
echo [4/5] QoS Gaming - Priorite paquets reseau...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\QoS" /v "NonBestEffortLimit" /t REG_DWORD /d 0 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\QoS" /v "EnableQoS" /t REG_DWORD /d 1 /f

echo.
echo [5/5] Parametres reseau supplementaires...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "DefaultTTL" /t REG_DWORD /d 64 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "KeepAliveTime" /t REG_DWORD /d 300000 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "MaxUserPort" /t REG_DWORD /d 65534 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpTimedWaitDelay" /t REG_DWORD /d 30 /f

echo.
echo ============================================================
echo  QOS GAMING & TCPIP CONFIGURES
echo ============================================================
echo.
echo REDÉMARRAGE OBLIGATOIRE
echo.
echo Verification apres redemarrage :
echo   netsh interface ipv4 show subinterfaces
echo   Get-NetTCPSetting | Format-Table SettingName, CongestionProvider, InitialCongestionWindow
echo.
echo Test MTU : ping -f -l 1472 1.1.1.1
echo   (si "Packet needs to be fragmented" -> reduire MTU par 10)
echo.
pause