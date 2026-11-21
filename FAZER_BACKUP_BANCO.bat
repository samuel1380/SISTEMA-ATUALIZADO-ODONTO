@echo off
chcp 65001 >nul
title BACKUP DO BANCO DE DADOS - ODONTOPRINT
color 0B

echo =======================================================================
echo              ODONTOPRINT - BACKUP DO BANCO DE DADOS LOCAL
echo =======================================================================
echo.

set ANO=%date:~6,4%
set MES=%date:~3,2%
set DIA=%date:~0,2%
set HORA=%time:~0,2%
if "%HORA:~0,1%" == " " set HORA=0%HORA:~1,1%
set MIN=%time:~3,2%

set NOME_ARQUIVO=backup_odontoprint_%ANO%-%MES%-%DIA%_%HORA%-%MIN%.sql
set DESTINO=%USERPROFILE%\Desktop\%NOME_ARQUIVO%

echo Salvando banco de dados local em:
echo %DESTINO%
echo.

"C:\Program Files\MariaDB 13.0\bin\mysqldump.exe" -u odontoprint -p123456 odontoprint_db > "%DESTINO%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCESSO] Backup salvo com sucesso na sua Area de Trabalho!
    echo Arquivo: %NOME_ARQUIVO%
) else (
    echo.
    echo [ERRO] Nao foi possivel realizar o backup. Verifique se o MySQL/MariaDB esta rodando.
)

echo.
pause

