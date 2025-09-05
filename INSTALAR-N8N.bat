@echo off
title INSTALADOR N8N - Atendechat
color 0B

echo.
echo  ███╗   ██╗██████╗ ███████╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
echo  ████╗  ██║╚══██╔╝██╔════╝    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
echo  ██╔██╗ ██║  ██║  █████╗      ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
echo  ██║╚██╗██║  ██║  ██╔══╝      ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
echo  ██║ ╚████║  ██║  ███████╗    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
echo  ╚═╝  ╚═══╝  ╚═╝  ╚══════╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
echo.
echo                           🔧 INSTALADOR AUTOMÁTICO DO N8N 🔧
echo                              Para Automação de Workflows
echo.
echo ================================================================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado!
)

echo.
echo [2/5] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: npm nao encontrado!
    pause
    exit /b 1
) else (
    echo ✅ npm encontrado!
)

echo.
echo [3/5] Instalando N8N globalmente...
echo ⏳ Isso pode levar alguns minutos...
npm install -g n8n
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao instalar N8N
    echo.
    echo Tentando instalar com permissões de administrador...
    echo Execute este script como administrador e tente novamente.
    pause
    exit /b 1
) else (
    echo ✅ N8N instalado com sucesso!
)

echo.
echo [4/5] Verificando instalação...
n8n --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: N8N nao foi instalado corretamente
    pause
    exit /b 1
) else (
    echo ✅ N8N instalado e funcionando!
)

echo.
echo [5/5] Criando script de inicialização...
echo @echo off > INICIAR-N8N.bat
echo title N8N - Atendechat >> INICIAR-N8N.bat
echo color 0A >> INICIAR-N8N.bat
echo echo. >> INICIAR-N8N.bat
echo echo 🚀 Iniciando N8N... >> INICIAR-N8N.bat
echo echo 🌐 Acesse: http://localhost:5678 >> INICIAR-N8N.bat
echo echo. >> INICIAR-N8N.bat
echo n8n start >> INICIAR-N8N.bat
echo pause >> INICIAR-N8N.bat

echo ✅ Script de inicialização criado!

echo.
echo ================================================================================
echo                           🎉 N8N INSTALADO COM SUCESSO! 🎉
echo ================================================================================
echo.
echo 📋 PRÓXIMOS PASSOS:
echo.
echo 1. Execute o arquivo "INICIAR-N8N.bat" para iniciar o N8N
echo 2. Acesse http://localhost:5678 no seu navegador
echo 3. Crie uma conta no N8N (primeira vez)
echo 4. Configure os workflows para seu chatbot
echo.
echo 🔧 CONFIGURAÇÃO RECOMENDADA:
echo.
echo - URL do N8N: http://localhost:5678
echo - Porta: 5678 (padrão)
echo - Banco de dados: SQLite (padrão)
echo.
echo 📚 TEMPLATES DISPONÍVEIS:
echo.
echo ✅ Fluxo de Boas-vindas WhatsApp
echo ✅ Resposta com IA (OpenAI)
echo ✅ Integração com APIs externas
echo ✅ Processamento de dados
echo.
echo 🚀 Para iniciar o N8N agora, execute:
echo    INICIAR-N8N.bat
echo.
echo 💡 Dica: Mantenha o N8N rodando em uma janela separada
echo    enquanto usa o sistema Atendechat.
echo.
pause
