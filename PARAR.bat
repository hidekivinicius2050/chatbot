@echo off
title PARAR SISTEMA - Atendechat
color 0C

echo.
echo  ██████╗  █████╗ ██████╗  █████╗ ██████╗ 
echo ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗
echo ██████╔╝███████║██████╔╝███████║██████╔╝
echo ██╔═══╝ ██╔══██║██╔══██╗██╔══██║██╔══██╗
echo ██║     ██║  ██║██║  ██║██║  ██║██║  ██║
echo ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo                           🛑 PARANDO SISTEMA 🛑
echo.
echo ================================================================================
echo.

echo [1/2] Parando todos os processos Node.js...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Processos Node.js finalizados!
) else (
    echo ℹ️  Nenhum processo Node.js encontrado.
)

echo.
echo [2/2] Fechando janelas do sistema...
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Backend API*" >nul 2>&1
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Frontend Web*" >nul 2>&1
echo ✅ Janelas do sistema fechadas!

echo.
echo ================================================================================
echo                           ✅ SISTEMA PARADO COM SUCESSO! ✅
echo ================================================================================
echo.
echo 💡 Para iniciar novamente, execute o arquivo "INICIAR.bat"
echo.
pause
