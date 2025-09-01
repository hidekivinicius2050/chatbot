Write-Host "Verificando vulnerabilidades de seguranca..." -ForegroundColor Green

# Verificar se pnpm está instalado
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm nao encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pnpm
}

Write-Host "Verificando vulnerabilidades com npm audit..." -ForegroundColor Cyan
pnpm audit --audit-level moderate

Write-Host "Verificacao de seguranca concluida!" -ForegroundColor Green
