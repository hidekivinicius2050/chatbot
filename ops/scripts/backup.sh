#!/bin/bash

# ========================================
# ATENDECHAT 2.0 - SCRIPT DE BACKUP
# ========================================
# Script para backup de dados críticos

set -e

# ========================================
# CONFIGURAÇÕES
# ========================================
PROJECT_DIR="/opt/atendechat"
BACKUP_DIR="/opt/atendechat/backups"
LOG_FILE="/opt/atendechat/logs/backup.log"
RETENTION_DAYS=30

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
# BACKUP DO .ENV
# ========================================
backup_env() {
    info "Fazendo backup do .env.production..."
    
    if [ -f "$PROJECT_DIR/.env.production" ]; then
        cp "$PROJECT_DIR/.env.production" "$BACKUP_DIR/.env.production.backup.$(date +%Y%m%d_%H%M%S)"
        success "Backup do .env concluído"
    else
        info "Arquivo .env.production não encontrado, pulando..."
    fi
}

# ========================================
# BACKUP DOS VOLUMES DOCKER
# ========================================
backup_volumes() {
    info "Fazendo backup dos volumes Docker..."
    
    cd "$PROJECT_DIR"
    
    # Listar volumes
    VOLUMES=$(docker volume ls --format "{{.Name}}" | grep atendechat)
    
    if [ -n "$VOLUMES" ]; then
        for volume in $VOLUMES; do
            info "Backup do volume: $volume"
            
            # Criar container temporário para backup
            docker run --rm \
                -v "$volume":/data \
                -v "$BACKUP_DIR":/backup \
                alpine tar -czf "/backup/volume_${volume}_$(date +%Y%m%d_%H%M%S).tar.gz" -C /data .
                
            success "Volume $volume backupado"
        done
    else
        info "Nenhum volume encontrado para backup"
    fi
}

# ========================================
# BACKUP DO BANCO (NEON)
# ========================================
backup_database() {
    info "Fazendo backup do banco de dados..."
    
    # Verificar se variáveis de ambiente estão disponíveis
    if [ -f "$PROJECT_DIR/.env.production" ]; then
        source "$PROJECT_DIR/.env.production"
        
        if [ -n "$DATABASE_URL" ]; then
            # Extrair informações da URL do banco
            DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
            DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
            DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            
            # Backup usando pg_dump
            if command -v pg_dump > /dev/null 2>&1; then
                PGPASSWORD="$DB_PASS" pg_dump \
                    -h "$DB_HOST" \
                    -U "$DB_USER" \
                    -d "$DB_NAME" \
                    --no-password \
                    --verbose \
                    --clean \
                    --no-owner \
                    --no-privileges \
                    > "$BACKUP_DIR/database_$(date +%Y%m%d_%H%M%S).sql"
                    
                success "Backup do banco concluído"
            else
                info "pg_dump não disponível, pulando backup do banco..."
            fi
        else
            info "DATABASE_URL não configurada, pulando backup do banco..."
        fi
    else
        info "Arquivo .env.production não encontrado, pulando backup do banco..."
    fi
}

# ========================================
# BACKUP DO REDIS (UPSTASH)
# ========================================
backup_redis() {
    info "Fazendo backup do Redis..."
    
    if [ -f "$PROJECT_DIR/.env.production" ]; then
        source "$PROJECT_DIR/.env.production"
        
        if [ -n "$REDIS_URL" ]; then
            # Backup usando redis-cli
            if command -v redis-cli > /dev/null 2>&1; then
                # Extrair host e porta do Redis
                REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
                REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
                
                if [ -n "$REDIS_PASSWORD" ]; then
                    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --rdb "$BACKUP_DIR/redis_$(date +%Y%m%d_%H%M%S).rdb"
                else
                    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$BACKUP_DIR/redis_$(date +%Y%m%d_%H%M%S).rdb"
                fi
                
                success "Backup do Redis concluído"
            else
                info "redis-cli não disponível, pulando backup do Redis..."
            fi
        else
            info "REDIS_URL não configurada, pulando backup do Redis..."
        fi
    else
        info "Arquivo .env.production não encontrado, pulando backup do Redis..."
    fi
}

# ========================================
# BACKUP DOS LOGS
# ========================================
backup_logs() {
    info "Fazendo backup dos logs..."
    
    if [ -d "$PROJECT_DIR/logs" ]; then
        tar -czf "$BACKUP_DIR/logs_$(date +%Y%m%d_%H%M%S).tar.gz" -C "$PROJECT_DIR" logs/
        success "Backup dos logs concluído"
    else
        info "Diretório de logs não encontrado, pulando..."
    fi
}

# ========================================
# LIMPEZA DE BACKUPS ANTIGOS
# ========================================
cleanup_old_backups() {
    info "Limpando backups antigos (mais de $RETENTION_DAYS dias)..."
    
    find "$BACKUP_DIR" -name "*.backup.*" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.rdb" -mtime +$RETENTION_DAYS -delete
    
    success "Limpeza de backups antigos concluída"
}

# ========================================
# VERIFICAÇÃO DE ESPAÇO
# ========================================
check_disk_space() {
    info "Verificando espaço em disco..."
    
    # Verificar espaço disponível
    AVAILABLE_SPACE=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    AVAILABLE_SPACE_MB=$((AVAILABLE_SPACE / 1024))
    
    if [ $AVAILABLE_SPACE_MB -lt 1000 ]; then
        error "Espaço insuficiente para backup (disponível: ${AVAILABLE_SPACE_MB}MB)"
    fi
    
    success "Espaço em disco OK (disponível: ${AVAILABLE_SPACE_MB}MB)"
}

# ========================================
# FUNÇÃO PRINCIPAL
# ========================================
main() {
    info "💾 Iniciando backup do AtendeChat 2.0..."
    
    # Criar diretórios necessários
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Verificar espaço em disco
    check_disk_space
    
    # Executar backups
    backup_env
    backup_volumes
    backup_database
    backup_redis
    backup_logs
    
    # Limpeza
    cleanup_old_backups
    
    success "🎉 Backup concluído com sucesso!"
    
    # Informações finais
    echo ""
    echo "📁 Diretório de backup: $BACKUP_DIR"
    echo "📊 Conteúdo do backup:"
    ls -lah "$BACKUP_DIR" | grep "$(date +%Y%m%d)"
    echo ""
    echo "💾 Espaço utilizado:"
    du -sh "$BACKUP_DIR"
}

# ========================================
# EXECUÇÃO
# ========================================
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
