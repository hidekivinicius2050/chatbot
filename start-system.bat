@echo off
echo ========================================
echo    ATENDECHAT - SISTEMA COMPLETO
echo ========================================
echo.
echo Iniciando sistema completo...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se pnpm está instalado
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: pnpm nao encontrado!
    echo Instalando pnpm...
    npm install -g pnpm
)

echo.
echo [1/4] Instalando dependencias...
call pnpm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [2/4] Iniciando Backend (API)...
start "Backend API" cmd /k "cd /d %~dp0apps\api && node simple-channels-server.js"

echo.
echo [3/4] Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Iniciando Frontend (Web)...
start "Frontend Web" cmd /k "cd /d %~dp0apps\web && pnpm run dev"

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

echo Abrindo navegador...
start http://localhost:3000

echo.
echo Sistema rodando! Feche esta janela quando terminar.
pause
