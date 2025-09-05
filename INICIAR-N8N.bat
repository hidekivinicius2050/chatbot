@echo off
title N8N - Atendechat
color 0A

echo.
echo  ███╗   ██╗██████╗ ███████╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
echo  ████╗  ██║╚══██╔╝██╔════╝    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
echo  ██╔██╗ ██║  ██║  █████╗      ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
echo  ██║╚██╗██║  ██║  ██╔══╝      ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
echo  ██║ ╚████║  ██║  ███████╗    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
echo  ╚═╝  ╚═══╝  ╚═╝  ╚══════╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
echo.
echo                           🚀 INICIANDO N8N PARA AUTOMAÇÃO 🚀
echo.
echo ================================================================================
echo.

echo [1/3] Verificando N8N...
n8n --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: N8N nao encontrado!
    echo.
    echo Execute primeiro o arquivo "INSTALAR-N8N.bat"
    echo.
    pause
    exit /b 1
) else (
    echo ✅ N8N encontrado!
)

echo.
echo [2/3] Verificando porta 5678...
netstat -an | find "5678" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  AVISO: Porta 5678 ja esta em uso!
    echo.
    echo Deseja continuar mesmo assim? (S/N)
    set /p choice=
    if /i "%choice%" neq "S" (
        echo Operacao cancelada.
        pause
        exit /b 1
    )
) else (
    echo ✅ Porta 5678 disponivel!
)

echo.
echo [3/3] Iniciando N8N...
echo.
echo 🌐 N8N sera iniciado em: http://localhost:5678
echo 🔧 Interface web disponivel em alguns segundos...
echo.
echo 💡 DICAS:
echo    - Primeira vez: Crie uma conta no N8N
echo    - Use os templates do Atendechat
echo    - Configure workflows para WhatsApp
echo.
echo ⏳ Iniciando servidor...
echo.

n8n start

echo.
echo ✅ N8N finalizado!
pause
