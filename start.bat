@echo off
title PDF Tools Studio - Servidor Local
echo ========================================================
echo        Iniciando PDF Tools Studio (Modo Local)
echo ========================================================
echo.
echo Abriendo la aplicacion en tu navegador...
echo URL: http://localhost:8080/index.html
echo.
echo Presiona Ctrl + C en esta ventana para detener el servidor.
echo ========================================================
echo.

start "" http://localhost:8080/index.html

python -m http.server 8080

if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Python no fue detectado en el sistema.
    echo Abriendo index.html directamente...
    start "" "%~dp0index.html"
    pause
)
