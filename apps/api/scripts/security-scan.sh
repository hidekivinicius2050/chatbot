#!/bin/bash

echo "🔒 Verificando vulnerabilidades de segurança..."

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não encontrado. Instalando..."
    npm install -g pnpm
fi

# Verificar se osv-scanner está instalado
if ! command -v osv-scanner &> /dev/null; then
    echo "❌ osv-scanner não encontrado. Instalando..."
    go install github.com/google/osv-scanner/cmd/osv-scanner@latest
fi

echo "📦 Verificando vulnerabilidades com npm audit..."
pnpm audit --audit-level moderate

echo "🔍 Verificando vulnerabilidades com osv-scanner..."
osv-scanner --lockfile=pnpm-lock.yaml

echo "✅ Verificação de segurança concluída!"
