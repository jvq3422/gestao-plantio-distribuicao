@echo off
title Fazenda Recreio do Morro - Gestao de Plantio, Adubacao e Distribuicao
echo ===================================================================
echo   FAZENDA RECREIO DO MORRO - CHAPADA DIAMANTINA
echo   Sistema Integrado de Gestao: Plantio, Adubacao e Distribuicao
echo ===================================================================
echo.
cd /d "%~dp0cafe-gestao"

if not exist node_modules (
    echo [Primeira Execucao] Instalando dependencias do projeto...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias do Node.js. Verifique se o Node.js esta instalado.
        pause
        exit /b %errorlevel%
    )
    echo [Sucesso] Dependencias instaladas com exito!
    echo.
)

echo Iniciando servidor da aplicacao...
echo O sistema estara acessivel no computador e na rede local para celular.
echo.
call npm run dev -- --host
pause
