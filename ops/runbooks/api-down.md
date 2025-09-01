# 🚨 RUNBOOK: API DOWN

## 📋 **DESCRIÇÃO DO PROBLEMA**
A API do AtendeChat não está respondendo ou retornando erros 5xx.

## 🔍 **DIAGNÓSTICO RÁPIDO**

### **1. Verificar Status dos Containers**
```bash
cd /opt/atendechat
docker compose -f compose.prod.yml ps api
```

**Status Esperado**: `Up (healthy)`

### **2. Verificar Health Check**
```bash
curl -f http://localhost:8080/api/v1/health
```

**Resposta Esperada**: `200 OK`

### **3. Verificar Logs da API**
```bash
docker compose -f compose.prod.yml logs --tail=50 api
```

## 🚨 **PROCEDIMENTOS DE EMERGÊNCIA**

### **PASSO 1: Verificar Dependências**
```bash
# Verificar se Redis está rodando
docker compose -f compose.prod.yml ps redis

# Verificar se banco está acessível
docker compose -f compose.prod.yml exec api pnpm prisma db execute --stdin
```

### **PASSO 2: Restart do Serviço**
```bash
# Restart da API
docker compose -f compose.prod.yml restart api

# Aguardar health check
sleep 30

# Verificar status
docker compose -f compose.prod.yml ps api
```

### **PASSO 3: Verificar Recursos do Sistema**
```bash
# CPU e Memória
docker stats api --no-stream

# Espaço em disco
df -h

# Logs do sistema
journalctl -u docker --since "10 minutes ago"
```

## 🔧 **RESOLUÇÃO DE PROBLEMAS COMUNS**

### **Problema: Container não inicia**
```bash
# Verificar logs de inicialização
docker compose -f compose.prod.yml logs api

# Verificar se .env.production está correto
cat .env.production | grep -E "(DATABASE_URL|REDIS_URL|JWT_SECRET)"

# Verificar se portas estão disponíveis
netstat -tlnp | grep :8080
```

### **Problema: Erro de conexão com banco**
```bash
# Testar conexão com banco
docker compose -f compose.prod.yml exec api pnpm prisma db execute --stdin

# Verificar variáveis de ambiente
docker compose -f compose.prod.yml exec api env | grep DATABASE

# Verificar se banco está acessível externamente
curl -f $DATABASE_URL
```

### **Problema: Erro de conexão com Redis**
```bash
# Testar conexão com Redis
docker compose -f compose.prod.yml exec api redis-cli -h redis ping

# Verificar variáveis de ambiente
docker compose -f compose.prod.yml exec api env | grep REDIS

# Verificar se Redis está acessível
docker compose -f compose.prod.yml exec redis redis-cli ping
```

### **Problema: Erro de JWT/Secrets**
```bash
# Verificar se JWT_SECRET está definido
docker compose -f compose.prod.yml exec api env | grep JWT

# Verificar se arquivo .env.production existe
ls -la .env.production

# Verificar permissões do arquivo
ls -la .env.production
```

## 📊 **VERIFICAÇÃO PÓS-RESOLUÇÃO**

### **1. Health Check**
```bash
curl -f http://localhost:8080/api/v1/health
```

### **2. Métricas**
```bash
curl -f http://localhost:8080/api/v1/metrics
```

### **3. Endpoint de Teste**
```bash
curl -f http://localhost:8080/api/v1/auth/health
```

### **4. Logs de Acesso**
```bash
docker compose -f compose.prod.yml logs --tail=20 api | grep "200\|201\|404\|500"
```

## 🚀 **ESCALONAMENTO**

### **Se o problema persistir após 15 minutos:**
1. **Notificar DevOps Lead**
2. **Executar rollback automático** (se configurado)
3. **Verificar métricas do Prometheus**
4. **Analisar logs do Caddy**

### **Se o problema afetar múltiplos usuários:**
1. **Notificar Tech Lead e CTO**
2. **Verificar status de outros serviços**
3. **Considerar restart completo da stack**
4. **Verificar se é problema de infraestrutura**

## 📝 **DOCUMENTAÇÃO DO INCIDENTE**

### **Informações a registrar:**
- **Timestamp do início**: `YYYY-MM-DD HH:MM:SS`
- **Timestamp da resolução**: `YYYY-MM-DD HH:MM:SS`
- **Sintomas observados**: Descrição do problema
- **Ações executadas**: Comandos e procedimentos
- **Causa raiz**: Motivo do problema
- **Tempo de resolução**: Duração total
- **Impacto**: Número de usuários afetados
- **Prevenção**: Medidas para evitar recorrência

## 🔗 **LINKS ÚTEIS**

- [Métricas do Prometheus](http://localhost:9090)
- [Logs do Grafana](http://localhost:3001)
- [Status do Uptime-Kuma](http://localhost:3002)
- [Documentação da API](../api/README.md)
- [Guia de Troubleshooting](../troubleshooting.md)
