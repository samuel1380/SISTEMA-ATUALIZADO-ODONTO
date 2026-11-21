@echo off
chcp 65001 >nul
title ODONTOPRINT - PARAR SERVIDOR
color 0C

echo =======================================================================
echo              ODONTOPRINT - ENCERRANDO PROCESSOS DO SERVIDOR
echo =======================================================================
echo.

echo Fechando Cloudflare Tunnel...
taskkill /f /im cloudflared.exe >nul 2>&1

echo Fechando Frontend e Backend (Node.js)...
taskkill /f /im node.exe >nul 2>&1

echo.
echo [OK] Todos os servicos web foram encerrados.
echo (O Banco de Dados MySQL permanece rodando em segundo plano com seguranca)
echo.
echo =======================================================================
echo.
pause

