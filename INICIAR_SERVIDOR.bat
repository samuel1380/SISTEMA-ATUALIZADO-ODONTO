@echo off
chcp 65001 >nul
title ODONTOPRINT - SERVIDOR COMPLETO
color 0A

echo =======================================================================
echo              ODONTOPRINT - INICIALIZANDO SERVIDOR COMPLETO
echo =======================================================================
echo.

:: 1. Verificar e Iniciar o Banco de Dados MySQL / MariaDB
echo [1/4] Verificando Banco de Dados MySQL / MariaDB (Porta 3306)...
sc query MySQL | find "RUNNING" >nul
if %ERRORLEVEL% NEQ 0 (
    echo       Iniciando o servico MySQL...
    net start MySQL >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo       [OK] Banco de Dados MySQL iniciado com sucesso!
    ) else (
        echo       [AVISO] Verifique se o MySQL ja esta rodando como servico.
    )
) else (
    echo       [OK] Banco de Dados MySQL ja esta rodando na porta 3306!
)
echo.

:: 2. Iniciar o Backend (Porta 3002)
echo [2/4] Iniciando Backend NestJS (Porta 3002)...
start "Odontoprint - Backend (Porta 3002)" cmd /k "cd /d "%~dp0node-bff-odontoprint-master" && echo Iniciando Backend... && node dist/src/main.js"

:: Aguardar inicializacao do backend
timeout /t 4 /nobreak >nul
echo       [OK] Janela do Backend iniciada!
echo.

:: 3. Iniciar o Frontend (Porta 4200)
echo [3/4] Iniciando Frontend Angular (Porta 4200)...
echo       (Aguarde cerca de 40 a 50 segundos para o Angular compilar o sistema)
start "Odontoprint - Frontend (Porta 4200)" cmd /k "cd /d "%~dp0ang-odontoprint-master" && echo Compilando Frontend Angular... && npm run start -- --host 0.0.0.0 --disable-host-check --port 4200"

:: Aguardar um momento
timeout /t 6 /nobreak >nul
echo       [OK] Janela do Frontend iniciada!
echo.

:: 4. Iniciar Cloudflare Tunnel (Link Gratis)
echo [4/4] Conectando ao Cloudflare Tunnel (Link Publico Seguro e Gratis)...
start "Odontoprint - Cloudflare Tunnel" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar_tunnel.ps1"

echo       [OK] Janela do Cloudflare Tunnel iniciada!
echo.
echo =======================================================================
echo                      SISTEMA TOTALMENTE INICIADO!
echo =======================================================================
echo.
echo 1. Acesso direto nesta maquina (Servidor):
echo    http://localhost:4200
echo.
echo 2. Acesso para outros computadores da EMPRESA (Mesma rede / Wi-Fi):
echo    http://192.168.18.129:4200
echo.
echo 3. Acesso EXTERNO / INTERNET (Gratis via Cloudflare):
echo    O link "https://....trycloudflare.com" aparecera na janela do Cloudflare Tunnel!
echo    Ele sera copiado automaticamente para sua area de transferencia (Ctrl + V)
echo    e salvo no arquivo: LINK_PUBLICO.txt
echo.
echo =======================================================================
echo DICA: Mantenha as janelas abertas para o servidor continuar funcionando.
echo Para desligar tudo de uma vez, execute o arquivo PARAR_SERVIDOR.bat
echo =======================================================================
echo.

timeout /t 5 /nobreak >nul
start http://localhost:4200
pause
