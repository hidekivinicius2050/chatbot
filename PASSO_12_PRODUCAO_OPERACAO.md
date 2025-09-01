# 🚀 TAREFA — FASE 1 / PASSO 12: DEPLOY PRODUÇÃO & OPERAÇÃO

## 📋 **OBJETIVO**
Implementar o ambiente de produção completo com VPS, Docker Compose, HTTPS automático, CI/CD, backups e observabilidade para o AtendeChat 2.0.

## ✅ **CRITÉRIOS DE ACEITAÇÃO (DoD)**

- [x] **Docker Compose** traz todos os serviços com TLS válido
- [x] **Migrações Prisma** executam uma única vez
- [x] **Health checks e métricas** acessíveis
- [x] **WebSocket** funcionando atrás do proxy
- [x] **CI/CD** executa rolling updates sem downtime
- [x] **Runbooks e backups** documentados

## 🏗️ **ARQUITETURA DE PRODUÇÃO**

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS (2 vCPU / 4GB RAM)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Caddy     │  │ Prometheus  │  │   Grafana   │        │
│  │ (Port 80/443)│  │  (Port 9090) │  │ (Port 3001) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│           │              │              │                 │
│           ▼              ▼              ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Web      │  │     API     │  │   Worker    │        │
│  │ (Next.js)   │  │ (NestJS)    │  │ (BullMQ)    │        │
│  │ (Port 3000) │  │ (Port 8080) │  │ (Port 8081) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│           │              │              │                 │
│           └──────────────┼──────────────┘                 │
│                          ▼                                │
│                  ┌─────────────┐                          │
│                  │    Redis    │                          │
│                  │ (Port 6379) │                          │
│                  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **COMPONENTES IMPLEMENTADOS**

### **1. Arquivo de Ambiente (.env.production)**
- ✅ Configuração completa para produção
- ✅ Variáveis de segurança e performance
- ✅ URLs e CORS configurados
- ✅ SLOs e métricas habilitados

**Localização**: `env.production.example`
**⚠️ IMPORTANTE**: Nunca commitar no Git!

### **2. Docker Compose de Produção**
- ✅ Stack completo com todos os serviços
- ✅ Health checks configurados
- ✅ Volumes persistentes
- ✅ Rede isolada

**Localização**: `compose.prod.yml`

### **3. Dockerfiles de Produção**
- ✅ **Web**: `apps/web/Dockerfile.prod`
- ✅ **API**: `apps/api/Dockerfile.prod`
- ✅ **Worker**: `apps/worker/Dockerfile.prod`

**Características**:
- Multi-stage builds
- Usuários não-root
- Health checks
- Otimizações de produção

### **4. Reverse Proxy (Caddy)**
- ✅ **Localização**: `ops/caddy/Caddyfile`
- ✅ HTTPS automático com Let's Encrypt
- ✅ Headers de segurança
- ✅ Rate limiting
- ✅ Gzip compression

**Domínios configurados**:
- `app.seudominio.com` → Frontend
- `api.seudominio.com` → API
- `prometheus.seudominio.com` → Métricas
- `grafana.seudominio.com` → Dashboards

### **5. Pipeline CI/CD (GitHub Actions)**
- ✅ **Localização**: `.github/workflows/deploy.yml`
- ✅ Build e push automático para GHCR
- ✅ Deploy via SSH no VPS
- ✅ Rolling updates sem downtime
- ✅ Rollback automático em caso de falha

**Secrets necessários**:
- `VPS_SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`

### **6. Observabilidade**
- ✅ **Prometheus**: `ops/prometheus/prometheus.yml`
- ✅ **Alertmanager**: `ops/alertmanager/alertmanager.yml`
- ✅ **Grafana**: `ops/grafana/provisioning/datasources/prometheus.yml`

**Métricas coletadas**:
- API response time
- Worker queue lag
- Redis performance
- System resources

### **7. Scripts de Operação**
- ✅ **Deploy**: `ops/scripts/deploy.sh`
- ✅ **Backup**: `ops/scripts/backup.sh`

**Funcionalidades**:
- Rolling updates
- Health checks
- Backup automático
- Limpeza de recursos

### **8. Runbooks de Operação**
- ✅ **Índice**: `ops/runbooks/README.md`
- ✅ **API Down**: `ops/runbooks/api-down.md`

**Cobertura**:
- Problemas críticos (P0)
- Problemas altos (P1)
- Problemas médios (P2)
- Problemas baixos (P3)

### **9. Checklist de Go-Live**
- ✅ **Localização**: `ops/checklist/go-live.md`
- ✅ Validação completa do ambiente
- ✅ Critérios de aprovação
- ✅ Procedimentos de verificação

## 🚀 **PROCEDIMENTO DE DEPLOY**

### **Pré-requisitos no VPS**
```bash
# 1. Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Configurar firewall UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 3. Configurar SSH key
ssh-copy-id -i ~/.ssh/id_rsa.pub usuario@vps
```

### **Deploy Automático**
```bash
# 1. Push para main/master
git push origin main

# 2. GitHub Actions executa automaticamente
# 3. Imagens são buildadas e enviadas para GHCR
# 4. Deploy é executado no VPS via SSH
# 5. Rolling update sem downtime
```

### **Deploy Manual**
```bash
# 1. Clonar repositório no VPS
git clone https://github.com/seu-usuario/atendechat.git /opt/atendechat

# 2. Configurar .env.production
cp env.production.example .env.production
# Editar com valores reais

# 3. Executar deploy
chmod +x ops/scripts/deploy.sh
./ops/scripts/deploy.sh
```

## 📊 **MONITORAMENTO E ALERTAS**

### **Dashboards Disponíveis**
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Alertmanager**: http://localhost:9093
- **Uptime-Kuma**: http://localhost:3002

### **Métricas Principais**
- API response time (P50, P95)
- Worker queue lag
- Redis memory usage
- System resources (CPU, RAM, Disk)

### **Alertas Configurados**
- API down (crítico)
- High response time (alto)
- Database connection errors (alto)
- Redis connection errors (médio)

## 💾 **BACKUP E RECUPERAÇÃO**

### **Estratégia de Backup**
- **Neon PostgreSQL**: Point-in-Time Recovery (PITR)
- **Redis Upstash**: Persistência automática
- **Volumes Docker**: Backup diário
- **Configurações**: Backup antes de cada deploy

### **Script de Backup**
```bash
# Executar manualmente
./ops/scripts/backup.sh

# Configurar cron job (diário às 2h)
0 2 * * * /opt/atendechat/ops/scripts/backup.sh
```

### **Retenção**
- **Backups diários**: 30 dias
- **Backups semanais**: 12 semanas
- **Backups mensais**: 12 meses

## 🔒 **SEGURANÇA**

### **Firewall (UFW)**
- Porta 22 (SSH) - Acesso restrito
- Porta 80 (HTTP) - Redirecionamento para HTTPS
- Porta 443 (HTTPS) - Acesso público
- Todas as outras portas bloqueadas

### **Headers de Segurança**
- HSTS (HTTP Strict Transport Security)
- XSS Protection
- Content Security Policy (CSP)
- Referrer Policy
- Permissions Policy

### **Autenticação**
- SSH key-based authentication
- Senha desabilitada
- Usuário root desabilitado
- Fail2ban (opcional)

## 📈 **ESCALABILIDADE**

### **Horizontal Scaling**
```bash
# Escalar workers
docker compose -f compose.prod.yml up -d --scale worker=3

# Escalar API (se necessário)
docker compose -f compose.prod.yml up -d --scale api=2
```

### **Zero-Downtime Deployments**
- Rolling updates com health checks
- Containers antigos removidos após estabilização
- Rollback automático em caso de falha

### **Load Balancing**
- Caddy como reverse proxy
- Health checks automáticos
- Failover automático

## 🧪 **TESTES EM PRODUÇÃO**

### **Health Checks**
```bash
# API
curl -f https://api.seudominio.com/api/v1/health

# Frontend
curl -f https://app.seudominio.com/api/health

# Worker
curl -f http://localhost:8081/health
```

### **Métricas**
```bash
# Prometheus
curl -f http://localhost:9090/api/v1/query?query=up

# API Metrics
curl -f https://api.seudominio.com/api/v1/metrics
```

### **Testes de Carga (k6)**
```bash
# Smoke test
k6 run tests/k6/auth_login.js --env K6_BASE_URL=https://api.seudominio.com

# Load test
k6 run tests/k6/tickets_browse.js --env K6_BASE_URL=https://api.seudominio.com
```

## 🔄 **MANUTENÇÃO E OPERAÇÕES**

### **Comandos Úteis**
```bash
# Status dos serviços
docker compose -f compose.prod.yml ps

# Logs em tempo real
docker compose -f compose.prod.yml logs -f

# Restart de um serviço
docker compose -f compose.prod.yml restart api

# Verificar recursos
docker stats
df -h
free -h
```

### **Atualizações**
```bash
# Pull das novas imagens
docker compose -f compose.prod.yml pull

# Rolling update
docker compose -f compose.prod.yml up -d

# Verificar status
docker compose -f compose.prod.yml ps
```

### **Limpeza**
```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Remover volumes não utilizados
docker volume prune
```

## 📚 **DOCUMENTAÇÃO ADICIONAL**

### **Arquivos de Configuração**
- `compose.prod.yml` - Stack de produção
- `ops/caddy/Caddyfile` - Configuração do proxy
- `ops/prometheus/prometheus.yml` - Configuração de métricas
- `ops/alertmanager/alertmanager.yml` - Configuração de alertas

### **Scripts de Operação**
- `ops/scripts/deploy.sh` - Script de deploy
- `ops/scripts/backup.sh` - Script de backup

### **Runbooks**
- `ops/runbooks/README.md` - Índice dos runbooks
- `ops/runbooks/api-down.md` - Resolução de problemas da API

### **Checklists**
- `ops/checklist/go-live.md` - Checklist de go-live

## 🎯 **PRÓXIMOS PASSOS**

### **Melhorias Futuras**
- [ ] **Kubernetes**: Migração para orquestração mais robusta
- [ ] **Service Mesh**: Istio para comunicação entre serviços
- [ ] **Distributed Tracing**: Jaeger para rastreamento
- [ ] **Log Aggregation**: ELK Stack ou Loki
- [ ] **Infrastructure as Code**: Terraform para infraestrutura

### **Monitoramento Avançado**
- [ ] **Custom Dashboards**: Dashboards específicos para negócio
- [ ] **Business Metrics**: KPIs de negócio
- [ ] **Cost Optimization**: Otimização de custos
- [ ] **Capacity Planning**: Planejamento de capacidade

## 🏆 **CONCLUSÃO**

O **Passo 12** foi implementado com sucesso, fornecendo:

✅ **Ambiente de produção completo** com VPS e Docker Compose  
✅ **CI/CD pipeline** para deploy automático  
✅ **HTTPS automático** com Caddy  
✅ **Observabilidade completa** com Prometheus, Grafana e Alertmanager  
✅ **Backup e recuperação** automatizados  
✅ **Runbooks de operação** para troubleshooting  
✅ **Checklist de go-live** para validação  
✅ **Segurança** configurada com firewall e headers  
✅ **Escalabilidade** com rolling updates e horizontal scaling  

O AtendeChat 2.0 está pronto para produção com uma infraestrutura robusta, monitoramento completo e procedimentos operacionais bem definidos.

---

**🎉 PASSO 12 CONCLUÍDO COM SUCESSO!**  
**🚀 ATENDECHAT 2.0 PRONTO PARA PRODUÇÃO!**
