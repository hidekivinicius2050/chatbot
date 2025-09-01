# 🚨 RUNBOOKS DE OPERAÇÃO - ATENDECHAT 2.0

Este diretório contém os runbooks para resolução de problemas comuns em produção.

## 📋 ÍNDICE

### 🔴 **CRÍTICOS (P0)**
- [API Down](api-down.md) - API não responde
- [Database Down](database-down.md) - Banco de dados inacessível
- [Redis Down](redis-down.md) - Cache/Queue inacessível

### 🟡 **ALTOS (P1)**
- [High Response Time](high-response-time.md) - Latência alta
- [Queue Lag](queue-lag.md) - Filas atrasadas
- [Memory Leak](memory-leak.md) - Vazamento de memória

### 🟠 **MÉDIOS (P2)**
- [Webhook Failures](webhook-failures.md) - Falhas em webhooks
- [Rate Limiting](rate-limiting.md) - Limitação de taxa
- [SSL Issues](ssl-issues.md) - Problemas de certificado

### 🟢 **BAIXOS (P3)**
- [Log Rotation](log-rotation.md) - Rotação de logs
- [Backup Issues](backup-issues.md) - Problemas de backup
- [Monitoring Alerts](monitoring-alerts.md) - Alertas de monitoramento

## 🚀 **PROCEDIMENTOS RÁPIDOS**

### **Verificar Status dos Serviços**
```bash
cd /opt/atendechat
docker compose -f compose.prod.yml ps
```

### **Verificar Logs de um Serviço**
```bash
# API
docker compose -f compose.prod.yml logs -f api

# Worker
docker compose -f compose.prod.yml logs -f worker

# Caddy
docker compose -f compose.prod.yml logs -f caddy
```

### **Restart de um Serviço**
```bash
docker compose -f compose.prod.yml restart api
docker compose -f compose.prod.yml restart worker
```

### **Verificar Métricas**
```bash
# Prometheus
curl http://localhost:9090/api/v1/query?query=up

# API Metrics
curl http://localhost:8080/api/v1/metrics
```

### **Verificar Espaço em Disco**
```bash
df -h
docker system df
```

## 📞 **CONTATOS DE EMERGÊNCIA**

- **DevOps Lead**: devops@seudominio.com
- **Tech Lead**: tech@seudominio.com
- **CTO**: cto@seudominio.com

## 🔧 **FERRAMENTAS DISPONÍVEIS**

- **Docker Compose**: Orquestração de containers
- **Prometheus**: Métricas e alertas
- **Grafana**: Dashboards e visualização
- **Alertmanager**: Gerenciamento de alertas
- **Uptime-Kuma**: Monitoramento externo
- **Caddy**: Reverse proxy e logs

## 📚 **DOCUMENTAÇÃO ADICIONAL**

- [Guia de Deploy](deploy-guide.md)
- [Guia de Monitoramento](monitoring-guide.md)
- [Guia de Backup](backup-guide.md)
- [Guia de Segurança](security-guide.md)
