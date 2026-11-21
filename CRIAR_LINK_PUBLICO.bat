@echo off
chcp 65001 >nul
title ODONTOPRINT - LINK PUBLICO (CLOUDFLARE)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar_tunnel.ps1"
