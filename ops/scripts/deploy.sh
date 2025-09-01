#!/bin/bash

# ========================================
# ATENDECHAT 2.0 - SCRIPT DE DEPLOY
# ========================================
# Script para deploy em produção no VPS

set -e

# ========================================
# CONFIGURAÇÕES
# ========================================
PROJECT_DIR="/opt/atendechat"
COMPOSE_FILE="compose.prod.yml"
BACKUP_DIR="/opt/atendechat/backups"
LOG_FILE="/opt/atendechat/logs/deploy.log"

# ========================================
# FUNÇÕES
# ========================================
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    log "❌ ERRO: $1"
    exit 1
}

success() {
    log "✅ $1"
}

info() {
    log "ℹ️  $1"
}

# ========================================
# VERIFICAÇÕES INICIAIS
# ========================================
check_prerequisites() {
    info "Verificando pré-requisitos..."
    
    # Verificar se Docker está rodando
    if ! docker info > /dev/null 2>&1; then
        error "Docker não está rodando"
    fi
    
    # Verificar se Docker Compose está disponível
    if ! docker compose version > /dev/null 2>&1; then
        error "Docker Compose não está disponível"
    fi
    
    # Verificar se diretório do projeto existe
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Diretório do projeto não existe: $PROJECT_DIR"
    fi
    
    # Verificar se arquivo de compose existe
    if [ ! -f "$PROJECT_DIR/$COMPOSE_FILE" ]; then
        error "Arquivo de compose não existe: $PROJECT_DIR/$COMPOSE_FILE"
    fi
    
    success "Pré-requisitos verificados"
}

# ========================================
# BACKUP
# ========================================
create_backup() {
    info "Criando backup..."
    
    # Criar diretório de backup se não existir
    mkdir -p "$BACKUP_DIR"
    
    # Backup do .env
    if [ -f "$PROJECT_DIR/.env.production" ]; then
        cp "$PROJECT_DIR/.env.production" "$BACKUP_DIR/.env.production.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Backup dos volumes (opcional)
    if [ -d "$PROJECT_DIR/volumes" ]; then
        tar -czf "$BACKUP_DIR/volumes.backup.$(date +%Y%m%d_%H%M%S).tar.gz" -C "$PROJECT_DIR" volumes/
    fi
    
    success "Backup criado"
}

# ========================================
# PULL IMAGENS
# ========================================
pull_images() {
    info "Fazendo pull das imagens..."
    
    cd "$PROJECT_DIR"
    
    # Login no GHCR se necessário
    if [ -n "$GHCR_TOKEN" ]; then
        echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
    fi
    
    # Pull das imagens
    docker compose -f "$COMPOSE_FILE" pull
    
    success "Imagens atualizadas"
}

# ========================================
# ROLLING UPDATE
# ========================================
rolling_update() {
    info "Executando rolling update..."
    
    cd "$PROJECT_DIR"
    
    # Escalar serviços para 2 instâncias
    docker compose -f "$COMPOSE_FILE" up -d --no-deps --scale api=2 --scale worker=2
    
    # Aguardar health checks
    info "Aguardando health checks..."
    sleep 30
    
    # Verificar saúde dos serviços
    if ! docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy"; then
        error "Serviços não estão saudáveis após scaling"
    fi
    
    # Remover containers antigos
    docker compose -f "$COMPOSE_FILE" up -d
    
    success "Rolling update concluído"
}

# ========================================
# VERIFICAÇÃO
# ========================================
verify_deployment() {
    info "Verificando deployment..."
    
    # Verificar status dos containers
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" ps
    
    # Verificar logs dos serviços principais
    info "Verificando logs da API..."
    docker compose -f "$COMPOSE_FILE" logs --tail=20 api
    
    info "Verificando logs do Worker..."
    docker compose -f "$COMPOSE_FILE" logs --tail=20 worker
    
    # Verificar endpoints de health
    info "Verificando health checks..."
    
    # Aguardar um pouco para estabilização
    sleep 10
    
    # Verificar API
    if curl -f http://localhost:8080/api/v1/health > /dev/null 2>&1; then
        success "API está respondendo"
    else
        error "API não está respondendo"
    fi
    
    # Verificar Worker
    if curl -f http://localhost:8081/health > /dev/null 2>&1; then
        success "Worker está respondendo"
    else
        error "Worker não está respondendo"
    fi
    
    success "Deployment verificado com sucesso"
}

# ========================================
# LIMPEZA
# ========================================
cleanup() {
    info "Limpando recursos não utilizados..."
    
    # Remover imagens não utilizadas
    docker image prune -f
    
    # Remover containers parados
    docker container prune -f
    
    # Remover redes não utilizadas
    docker network prune -f
    
    success "Limpeza concluída"
}

# ========================================
# FUNÇÃO PRINCIPAL
# ========================================
main() {
    info "🚀 Iniciando deploy do AtendeChat 2.0..."
    
    # Criar diretório de logs se não existir
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Executar etapas do deploy
    check_prerequisites
    create_backup
    pull_images
    rolling_update
    verify_deployment
    cleanup
    
    success "🎉 Deploy concluído com sucesso!"
    
    # Informações finais
    echo ""
    echo "🌐 URLs de acesso:"
    echo "  Frontend: https://app.seudominio.com"
    echo "  API: https://api.seudominio.com"
    echo "  Métricas: https://prometheus.seudominio.com"
    echo "  Grafana: https://grafana.seudominio.com"
    echo "  Alertmanager: https://alertmanager.seudominio.com"
    echo "  Uptime: https://uptime.seudominio.com"
    echo ""
    echo "📊 Status dos serviços:"
    docker compose -f "$PROJECT_DIR/$COMPOSE_FILE" ps
}

# ========================================
# EXECUÇÃO
# ========================================
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
