@echo off
chcp 65001 > nul
echo ========================================
echo    INICIANDO SISTEMA CHATBOT
echo ========================================
echo.

echo [1/3] Parando processos Node.js existentes...
taskkill /f /im node.exe > nul 2>&1

echo [2/3] Iniciando servidor mock (porta 3001)...
cd apps\api
start "Servidor Mock" cmd /k "node simple-channels-server.js"
cd ..\..

echo [3/3] Aguardando servidor inicializar...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend Mock: http://localhost:3001
echo.
echo Agora voce pode acessar http://localhost:3000/ai-config
echo.
pause