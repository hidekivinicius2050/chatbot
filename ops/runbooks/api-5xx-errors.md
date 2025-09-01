# Runbook: Erros 5xx da API

**Versão:** 1.0.0-rc.1  
**Categoria:** API/Backend  
**Severidade:** ALTA  
**Tempo de Resolução Esperado:** 15-30 minutos  

## 🚨 Visão Geral

Este runbook descreve os passos para investigar e resolver erros 5xx (Internal Server Error) na API.

---

## 📋 Sintomas

### Indicadores de Problema
- [ ] Usuários reportando erros 500/502/503/504
- [ ] Logs mostrando exceções não tratadas
- [ ] Métricas de error rate > 1%
- [ ] Tempo de resposta > 5 segundos
- [ ] Health checks falhando

### Impacto
- **Usuários:** Não conseguem usar funcionalidades críticas
- **Negócio:** Perda de produtividade e possível perda de dados
- **Sistema:** Degradação de performance

---

## 🔍 Investigação Inicial

### 1.1 Verificar Status dos Serviços
```bash
# Verificar health check da API
curl -f http://localhost:3001/api/v1/health

# Verificar logs do container
docker logs <container-api> --tail 100

# Verificar status do banco
docker exec <container-db> psql -U postgres -c "SELECT version();"
```

### 1.2 Verificar Métricas
```bash
# Verificar métricas de erro
curl http://localhost:3001/metrics | grep "http_requests_total"

# Verificar uso de recursos
docker stats <container-api>
```

---

## 🛠️ Resolução

### 2.1 Erro 500 - Internal Server Error

#### Causas Comuns
- Exceção não tratada no código
- Problema de configuração
- Erro de banco de dados
- Problema de memória

#### Ações
```bash
# 1. Verificar logs de erro
docker logs <container-api> --tail 200 | grep -i error

# 2. Verificar uso de memória
docker stats <container-api> --no-stream

# 3. Reiniciar container se necessário
docker restart <container-api>

# 4. Verificar health check
curl -f http://localhost:3001/api/v1/health
```

### 2.2 Erro 502 - Bad Gateway

#### Causas Comuns
- API não está respondendo
- Problema de proxy/load balancer
- Container travado

#### Ações
```bash
# 1. Verificar se a API está rodando
docker ps | grep api

# 2. Verificar portas
netstat -tlnp | grep :3001

# 3. Reiniciar container
docker restart <container-api>

# 4. Verificar logs de inicialização
docker logs <container-api> --tail 50
```

### 2.3 Erro 503 - Service Unavailable

#### Causas Comuns
- API em manutenção
- Problema de dependências
- Overload do sistema

#### Ações
```bash
# 1. Verificar dependências
curl -f http://localhost:3001/api/v1/health

# 2. Verificar banco de dados
docker exec <container-db> pg_isready

# 3. Verificar Redis
docker exec <container-redis> redis-cli ping

# 4. Verificar uso de CPU/memória
docker stats <container-api>
```

### 2.4 Erro 504 - Gateway Timeout

#### Causas Comuns
- Timeout de banco de dados
- Operação muito lenta
- Problema de rede

#### Ações
```bash
# 1. Verificar queries lentas
docker logs <container-api> | grep "slow query"

# 2. Verificar conexões de banco
docker exec <container-db> psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 3. Verificar timeouts de rede
ping <database-host>
```

---

## 🔧 Resolução Avançada

### 3.1 Problemas de Banco de Dados
```bash
# Verificar conexões ativas
docker exec <container-db> psql -U postgres -c "
SELECT pid, usename, application_name, client_addr, state, query_start, query 
FROM pg_stat_activity 
WHERE state = 'active';"

# Matar queries problemáticas
docker exec <container-db> psql -U postgres -c "SELECT pg_terminate_backend(pid);"

# Verificar locks
docker exec <container-db> psql -U postgres -c "
SELECT l.pid, l.mode, l.granted, a.usename, a.query 
FROM pg_locks l 
JOIN pg_stat_activity a ON l.pid = a.pid;"
```

### 3.2 Problemas de Memória
```bash
# Verificar uso de memória
docker stats <container-api> --no-stream

# Verificar heap dump (se aplicável)
docker exec <container-api> jmap -dump:format=b,file=/tmp/heap.hprof <pid>

# Reiniciar com mais memória se necessário
docker update --memory 2g <container-api>
```

### 3.3 Problemas de Rede
```bash
# Verificar conectividade
docker exec <container-api> ping <database-host>
docker exec <container-api> telnet <database-host> 5432

# Verificar DNS
docker exec <container-api> nslookup <database-host>

# Verificar firewall
docker exec <container-api> iptables -L
```

---

## 📊 Monitoramento Pós-Resolução

### 4.1 Verificações
- [ ] Health check respondendo
- [ ] Error rate < 0.1%
- [ ] Tempo de resposta < 2s
- [ ] Logs limpos
- [ ] Usuários conseguindo acessar

### 4.2 Métricas a Acompanhar
```bash
# Verificar métricas por 15 minutos
watch -n 30 'curl -s http://localhost:3001/metrics | grep "http_requests_total"'

# Verificar logs em tempo real
docker logs -f <container-api>
```

---

## 🚨 Escalação

### 5.1 Quando Escalar
- **15 minutos:** Erro não resolvido
- **30 minutos:** Múltiplos erros
- **1 hora:** Sistema instável
- **Imediatamente:** Perda de dados

### 5.2 Contatos de Escalação
1. **DevOps Lead:** ___________ (Slack: @devops-lead)
2. **Desenvolvedor Senior:** ___________ (Slack: @senior-dev)
3. **Product Owner:** ___________ (Slack: @po)

---

## 📝 Documentação

### 6.1 Registrar Incidente
- [ ] **Timeline documentada**
  - [ ] Hora do início
  - [ ] Ações tomadas
  - [ ] Tempo de resolução
  - [ ] Causa raiz

### 6.2 Atualizar Runbook
- [ ] **Lições aprendidas**
  - [ ] Novas soluções identificadas
  - [ ] Procedimentos atualizados
  - [ ] Treinamento planejado

---

## 🔄 Prevenção

### 7.1 Monitoramento Proativo
- [ ] Alertas configurados para error rate > 0.5%
- [ ] Health checks a cada 30 segundos
- [ ] Métricas de performance em tempo real
- [ ] Logs centralizados e analisados

### 7.2 Manutenção Preventiva
- [ ] Reinicialização programada dos containers
- [ ] Limpeza de logs antigos
- [ ] Verificação de uso de recursos
- [ ] Atualizações de segurança

---

## 📋 Checklist de Resolução

### Resolução Básica
- [ ] ✅ Problema identificado
- [ ] ✅ Ação corretiva aplicada
- [ ] ✅ Sistema estabilizado
- [ ] ✅ Health check funcionando
- [ ] ✅ Usuários conseguindo acessar

### Documentação
- [ ] ✅ Incidente documentado
- [ ] ✅ Causa raiz identificada
- [ ] ✅ Runbook atualizado
- [ ] ✅ Stakeholders notificados
- [ ] ✅ Próximos passos definidos

---

## 📞 Contatos

**DevOps:** ___________  
**Desenvolvimento:** ___________  
**QA:** ___________  
**Product Owner:** ___________  

**Slack:** #incidentes-api  
**Email:** incidentes@empresa.com  
**PagerDuty:** Escalação automática após 15 min
