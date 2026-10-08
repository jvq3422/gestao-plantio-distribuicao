@echo off
title Fazenda Recreio do Morro - Aplicativo Desktop
echo ===================================================================
echo   FAZENDA RECREIO DO MORRO - CHAPADA DIAMANTINA
echo   Modo Aplicativo Desktop (Janela Nativa para Windows)
echo ===================================================================
echo.
:: Se o executavel nativo .exe existir, abre diretamente
if exist "%~dp0Fazenda Recreio do Morro.exe" (
    echo Abrindo Fazenda Recreio do Morro.exe...
    start "" "%~dp0Fazenda Recreio do Morro.exe"
    exit
)

cd /d "%~dp0cafe-gestao"

if not exist node_modules (
    echo [Primeira Execucao] Instalando dependencias do projeto...
    call npm install
)

echo Iniciando sistema em janela nativa de desktop...
start /b cmd /c "npm run dev"

timeout /t 3 /nobreak >nul

:: Abre em modo janela de aplicativo independente nativa (sem abas e sem barra de URL)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173 --window-size=1280,820
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:5173 --window-size=1280,820
) else (
    start http://localhost:5173
)
