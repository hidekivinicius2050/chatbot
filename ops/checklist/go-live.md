# ✅ CHECKLIST DE GO-LIVE - ATENDECHAT 2.0

## 🎯 **OBJETIVO**
Validar que o ambiente de produção está funcionando corretamente antes do lançamento oficial.

## 📋 **CHECKLIST COMPLETO**

### 🔐 **0. SEGURANÇA E CONFIGURAÇÃO**

- [ ] **Firewall UFW configurado**
  - [ ] Porta 22 (SSH) aberta
  - [ ] Porta 80 (HTTP) aberta
  - [ ] Porta 443 (HTTPS) aberta
  - [ ] Outras portas bloqueadas

- [ ] **SSH configurado**
  - [ ] Acesso por chave SSH
  - [ ] Senha desabilitada
  - [ ] Usuário root desabilitado
  - [ ] Fail2ban configurado (opcional)

- [ ] **Variáveis de ambiente**
  - [ ] `.env.production` configurado
  - [ ] JWT_SECRET definido e seguro
  - [ ] DATABASE_URL configurada
  - [ ] REDIS_URL configurada
  - [ ] NODE_ENV=production

### 🐳 **1. DOCKER E CONTAINERS**

- [ ] **Docker instalado e funcionando**
  - [ ] `docker --version`
  - [ ] `docker compose version`
  - [ ] Docker daemon rodando

- [ ] **Imagens baixadas**
  - [ ] `docker images` mostra todas as imagens
  - [ ] Imagens com tags corretas
  - [ ] Tamanho das imagens adequado

- [ ] **Containers rodando**
  - [ ] `docker compose -f compose.prod.yml ps`
  - [ ] Todos os serviços com status "Up"
  - [ ] Health checks passando

### 🌐 **2. REDE E DOMÍNIOS**

- [ ] **DNS configurado**
  - [ ] `app.seudominio.com` → VPS
  - [ ] `api.seudominio.com` → VPS
  - [ ] `prometheus.seudominio.com` → VPS
  - [ ] `grafana.seudominio.com` → VPS

- [ ] **Certificados SSL**
  - [ ] HTTPS funcionando em todos os domínios
  - [ ] Certificados válidos
  - [ ] Redirecionamento HTTP → HTTPS

- [ ] **Portas acessíveis**
  - [ ] Porta 80 respondendo
  - [ ] Porta 443 respondendo
  - [ ] Outras portas bloqueadas

### 🔌 **3. SERVIÇOS PRINCIPAIS**

- [ ] **Frontend (Next.js)**
  - [ ] `https://app.seudominio.com` acessível
  - [ ] Página carrega sem erros
  - [ ] JavaScript funcionando
  - [ ] Assets estáticos carregando

- [ ] **API (NestJS)**
  - [ ] `https://api.seudominio.com/api/v1/health` retorna 200
  - [ ] `https://api.seudominio.com/api/v1/metrics` acessível
  - [ ] CORS configurado corretamente
  - [ ] Rate limiting funcionando

- [ ] **Worker (BullMQ)**
  - [ ] `http://localhost:8081/health` retorna 200
  - [ ] Conectado ao Redis
  - [ ] Processando jobs

- [ ] **Redis**
  - [ ] Container rodando
  - [ ] Acessível internamente
  - [ ] Persistência configurada

### 🗄️ **4. BANCO DE DADOS**

- [ ] **Neon PostgreSQL**
  - [ ] Conectando via DATABASE_URL
  - [ ] Migrações aplicadas (`prisma migrate deploy`)
  - [ ] Tabelas criadas
  - [ ] Índices funcionando

- [ ] **Prisma**
  - [ ] `prisma studio` funcionando (se necessário)
  - [ ] Seeds aplicados (se configurados)
  - [ ] Conexões funcionando

### 📊 **5. MONITORAMENTO**

- [ ] **Prometheus**
  - [ ] `http://localhost:9090` acessível
  - [ ] Coletando métricas da API
  - [ ] Coletando métricas do Worker
  - [ ] Targets saudáveis

- [ ] **Grafana**
  - [ ] `http://localhost:3001` acessível
  - [ ] Login funcionando (admin/admin123)
  - [ ] Datasource Prometheus configurado
  - [ ] Dashboards carregando

- [ ] **Alertmanager**
  - [ ] `http://localhost:9093` acessível
  - [ ] Configuração carregada
  - [ ] Alertas configurados

- [ ] **Uptime-Kuma**
  - [ ] `http://localhost:3002` acessível
  - [ ] Monitores configurados
  - [ ] Alertas funcionando

### 🔄 **6. FUNCIONALIDADES**

- [ ] **Autenticação**
  - [ ] Login funcionando
  - [ ] JWT tokens gerados
  - [ ] Refresh tokens funcionando
  - [ ] Logout funcionando

- [ ] **Tickets**
  - [ ] Criação de tickets
  - [ ] Listagem de tickets
  - [ ] Filtros funcionando
  - [ ] Paginação funcionando

- [ ] **Mensagens**
  - [ ] Envio de mensagens
  - [ ] Recebimento de mensagens
  - [ ] WebSocket funcionando
  - [ ] Notificações em tempo real

- [ ] **Campanhas**
  - [ ] Criação de campanhas
  - [ ] Envio em lote
  - [ ] Relatórios funcionando

### 📈 **7. PERFORMANCE**

- [ ] **Tempo de resposta**
  - [ ] API P50 < 200ms
  - [ ] API P95 < 500ms
  - [ ] Frontend carregamento < 3s

- [ ] **Recursos do sistema**
  - [ ] CPU < 80%
  - [ ] Memória < 80%
  - [ ] Disco < 80%
  - [ ] Rede funcionando

- [ ] **Cache**
  - [ ] Redis funcionando
  - [ ] Cache hit rate > 80%
  - [ ] TTLs configurados

### 🧪 **8. TESTES**

- [ ] **Testes de carga**
  - [ ] k6 executando sem erros
  - [ ] Métricas de performance OK
  - [ ] Sem timeouts

- [ ] **Testes de integração**
  - [ ] Webhooks funcionando
  - [ ] Integrações externas OK
  - [ ] APIs de terceiros respondendo

- [ ] **Testes de usuário**
  - [ ] Fluxo completo funcionando
  - [ ] UI responsiva
  - [ ] Sem erros visuais

### 💾 **9. BACKUP E RECUPERAÇÃO**

- [ ] **Backup automático**
  - [ ] Script de backup funcionando
  - [ ] Cron job configurado
  - [ ] Backups sendo criados

- [ ] **Teste de restauração**
  - [ ] Backup pode ser restaurado
  - [ ] Dados íntegros
  - [ ] Tempo de restauração aceitável

### 📝 **10. DOCUMENTAÇÃO**

- [ ] **Runbooks**
  - [ ] Runbooks criados
  - [ ] Procedimentos documentados
  - [ ] Contatos de emergência

- [ ] **Monitoramento**
  - [ ] Dashboards configurados
  - [ ] Alertas configurados
  - [ ] Métricas documentadas

- [ ] **Operações**
  - [ ] Scripts de deploy
  - [ ] Scripts de backup
  - [ ] Procedimentos de rollback

## 🚀 **EXECUÇÃO DO CHECKLIST**

### **Ordem de execução:**
1. **Segurança** (0)
2. **Docker** (1)
3. **Rede** (2)
4. **Serviços** (3)
5. **Banco** (4)
6. **Monitoramento** (5)
7. **Funcionalidades** (6)
8. **Performance** (7)
9. **Testes** (8)
10. **Backup** (9)
11. **Documentação** (10)

### **Comandos de verificação rápida:**
```bash
# Status geral
cd /opt/atendechat
docker compose -f compose.prod.yml ps

# Health checks
curl -f https://api.seudominio.com/api/v1/health
curl -f https://app.seudominio.com/api/health

# Métricas
curl -f http://localhost:8080/api/v1/metrics

# Logs
docker compose -f compose.prod.yml logs --tail=20
```

## ✅ **CRITÉRIOS DE APROVAÇÃO**

- [ ] **Todos os itens críticos marcados**
- [ ] **Nenhum erro 5xx**
- [ ] **Performance dentro dos SLOs**
- [ ] **Monitoramento funcionando**
- [ ] **Backup configurado**
- [ ] **Documentação completa**

## 🎯 **GO-LIVE APROVADO**

**Data**: `YYYY-MM-DD`
**Responsável**: `Nome do DevOps`
**Observações**: `Comentários adicionais`

---

**⚠️ IMPORTANTE**: Este checklist deve ser executado por pelo menos 2 pessoas antes do go-live.
