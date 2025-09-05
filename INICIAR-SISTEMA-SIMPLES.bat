@echo off
title ATENDECHAT - Sistema Completo
color 0A

echo.
echo  █████╗ ████████╗███████╗███╗   ██╗███████╗███████╗ ██████╗██╗  ██╗ █████╗ ████████╗
echo ██╔══██╗╚══██╔══╝██╔════╝████╗  ██║██╔════╝██╔════╝██╔════╝██║  ██║██╔══██╗╚══██╔══╝
echo ███████║   ██║   █████╗  ██╔██╗ ██║█████╗  █████╗  ██║     ███████║███████║   ██║   
echo ██╔══██║   ██║   ██╔══╝  ██║╚██╗██║██╔══╝  ██╔══╝  ██║     ██╔══██║██╔══██║   ██║   
echo ██║  ██║   ██║   ███████╗██║ ╚████║███████╗███████╗╚██████╗██║  ██║██║  ██║   ██║   
echo ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
echo.
echo                           🤖 SISTEMA DE CHATBOT INTELIGENTE 🤖
echo.
echo ================================================================================
echo.

echo [1/3] Parando processos anteriores...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Processos anteriores finalizados!

echo.
echo [2/3] Iniciando Backend (API)...
start "Backend API" cmd /k "cd /d %~dp0apps\api && echo ✅ Backend rodando em http://localhost:3001 && node simple-channels-server.js"

echo ⏳ Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Iniciando Frontend (Web)...
start "Frontend Web" cmd /k "cd /d %~dp0apps\web && echo ✅ Frontend rodando em http://localhost:3000 && pnpm run dev"

echo ⏳ Aguardando frontend inicializar...
timeout /t 10 /nobreak >nul

echo.
echo ================================================================================
echo                           🎉 SISTEMA INICIADO COM SUCESSO! 🎉
echo ================================================================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo.
echo 💡 Dica: Mantenha as janelas do terminal abertas!
echo.
echo 🚀 Abrindo navegador...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ Sistema rodando! Feche esta janela quando terminar.
echo.
pause
