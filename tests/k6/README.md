# Testes de Carga com k6

Este diretório contém os scripts de teste de carga para validar a performance e resiliência da API Atendechat.

## Pré-requisitos

1. **Instalar k6**: [https://k6.io/docs/getting-started/installation/](https://k6.io/docs/getting-started/installation/)
2. **API rodando**: `pnpm dev:api` (porta 8080)
3. **Usuário de teste**: admin@test.com / 123456

## Scripts Disponíveis

### 1. Auth Login (`auth_login.js`)
- **Objetivo**: Testar performance de autenticação
- **Carga**: 10 VUs em 5 minutos
- **SLO**: P95 < 350ms, < 1% erros
- **Execução**: `pnpm qa:smoke`

### 2. Tickets Browse (`tickets_browse.js`)
- **Objetivo**: Testar navegação e filtros de tickets
- **Carga**: 5 VUs em 7 minutos
- **SLO**: P95 < 350ms, < 1% erros
- **Execução**: `pnpm qa:soak`

### 3. Chat Send (`chat_send.js`)
- **Objetivo**: Testar envio de mensagens e queue lag
- **Carga**: 3 VUs em 7 minutos
- **SLO**: P95 < 1s, queue lag < 1s
- **Execução**: `pnpm qa:burst`

## Execução

### Smoke Test (1-2 min)
```bash
pnpm qa:smoke
```

### Soak Test (10-15 min)
```bash
pnpm qa:soak
```

### Burst Test (picos curtos)
```bash
pnpm qa:burst
```

## Configuração

### Variáveis de Ambiente
```bash
K6_BASE_URL=http://localhost:8080
K6_ACCESS_EMAIL=admin@test.com
K6_ACCESS_PASSWORD=123456
```

### Personalização
```bash
# Executar com parâmetros customizados
k6 run tests/k6/auth_login.js \
  --env K6_BASE_URL=http://localhost:8080 \
  --env K6_ACCESS_EMAIL=seu@email.com \
  --env K6_ACCESS_PASSWORD=suasenha
```

## Resultados

### Saída no Console
- Métricas em tempo real
- Thresholds (SLOs)
- Erros e falhas

### Arquivos de Saída
```bash
# Salvar resultados em JSON
k6 run --out json=results.json tests/k6/auth_login.js

# Salvar resultados em InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 tests/k6/auth_login.js
```

## SLOs (Service Level Objectives)

| Métrica | Target | Script |
|---------|--------|--------|
| API P95 | < 350ms | Todos |
| API P50 | < 120ms | Todos |
| Erros 5xx | < 0.5% | Todos |
| Queue Lag | < 1s | chat_send |
| WS Delivery | < 1s | chat_send |

## Troubleshooting

### Erro de Conexão
```bash
# Verificar se a API está rodando
curl http://localhost:8080/health

# Verificar logs da API
pnpm dev:api
```

### Erro de Autenticação
```bash
# Verificar credenciais
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

### Performance Baixa
1. Verificar recursos do sistema (CPU, RAM, I/O)
2. Verificar configurações do banco (pool, índices)
3. Verificar configurações do Redis
4. Verificar configurações do BullMQ

## Integração com CI/CD

### GitHub Actions
```yaml
- name: Run k6 Smoke Test
  run: |
    pnpm qa:smoke
  env:
    K6_BASE_URL: ${{ secrets.API_URL }}
    K6_ACCESS_EMAIL: ${{ secrets.TEST_EMAIL }}
    K6_ACCESS_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

### Jenkins
```groovy
stage('Performance Test') {
  steps {
    sh 'pnpm qa:smoke'
  }
  post {
    always {
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'tests/k6/out',
        reportFiles: '*.html',
        reportName: 'k6 Report'
      ])
    }
  }
}
```

## Próximos Passos

1. **Métricas Customizadas**: Adicionar métricas específicas do domínio
2. **Testes de Stress**: Identificar breaking points
3. **Testes de Spike**: Simular picos de tráfego
4. **Testes de Soak**: Executar por horas para detectar memory leaks
5. **Integração com Grafana**: Dashboards de performance
6. **Alertas**: Notificações quando SLOs são violados
