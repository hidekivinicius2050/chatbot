# Atendechat 2.0 - Sistema de Chat Multitenancy

Sistema de chat empresarial com arquitetura hexagonal, multitenancy, autenticação robusta e suporte a múltiplos provedores de WhatsApp.

## 🏗️ Arquitetura

- **Backend**: NestJS + TypeScript
- **Frontend**: Next.js 15 + React 18 (especificações detalhadas em `FRONTEND_SPECS.md`)
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Cache/Queues**: Redis (Upstash) + BullMQ
- **Real-time**: Socket.IO
- **Autenticação**: JWT + Argon2 + Refresh Token Rotation
- **Multitenancy**: Isolamento automático por `companyId`
- **RBAC**: Roles (owner, admin, agent, viewer)

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- pnpm
- PostgreSQL (Neon)
- Redis (Upstash)

### 1. Configuração do Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Preencher variáveis obrigatórias:
# - DATABASE_URL (Neon PostgreSQL)
# - REDIS_URL (Upstash Redis)
# - JWT_SECRET e JWT_REFRESH_SECRET
# - META_* (para WhatsApp Cloud API)
```

### 2. Instalação de Dependências

```bash
# Instalar dependências do monorepo
pnpm install

# Gerar cliente Prisma
pnpm run db:generate

# Aplicar schema ao banco
pnpm run db:push

# Executar seed com dados de exemplo
pnpm run db:seed
```

### 3. Executar Aplicação

```bash
# Desenvolvimento
pnpm run start:dev

# Produção
pnpm run build
pnpm run start:prod
```

## 📱 Funcionalidades Implementadas

### ✅ Fase 1 / Passo 1: Setup Base
- [x] Monorepo com Turborepo
- [x] Integração Neon (PostgreSQL) + Upstash (Redis)
- [x] Health checks e configuração básica

### ✅ Fase 1 / Passo 2: Autenticação e RBAC
- [x] Autenticação real com Argon2
- [x] JWT + Refresh Token Rotation
- [x] RBAC com roles (owner, admin, agent, viewer)
- [x] Multitenancy automática
- [x] Testes de cobertura ≥80%

### ✅ Fase 1 / Passo 3: Chat E2E
- [x] REST API para Tickets e Mensagens
- [x] Paginação cursor-based
- [x] Upload de arquivos locais
- [x] WebSocket events básicos

### ✅ Fase 1 / Passo 4: WhatsApp Providers
- [x] Interface `MessagingProvider` comum
- [x] WhatsApp Cloud API + Baileys
- [x] Webhook seguro com HMAC
- [x] Gerenciamento de sessões Baileys
- [x] Integração com BullMQ
- [x] Testes de integração e E2E

### ✅ Fase 1 / Passo 5: Campanhas + Scheduler + Analytics
- [x] **Sistema de Campanhas**: CRUD completo, gestão de alvos, ações (start/pause/resume/finish/cancel)
- [x] **Workers BullMQ**: `campaigns:enqueuer` e `campaigns:sender` com rate-limiting e retries
- [x] **Scheduler**: Cron jobs para rollup de agregados e recuperação de campanhas
- [x] **WebSocket Events**: Progresso em tempo real e notificações de finalização
- [x] **Sistema de Opt-out**: Gestão de cancelamentos por contato/canal
- [x] **Relatórios**: Diários, por campanha e resumidos
- [x] **Segurança**: RBAC, multitenancy, rate-limiting

## 📊 Sistema de Campanhas

### Funcionalidades Principais

- **Gestão de Campanhas**: Criação, edição, agendamento, execução
- **Segmentação de Alvos**: Adição de contatos como alvos
- **Rate Limiting**: Controle de mensagens por segundo por canal
- **Opt-out Management**: Respeito automático a cancelamentos
- **Progresso em Tempo Real**: WebSocket events para acompanhamento
- **Relatórios**: Métricas detalhadas e exportação

### Como Usar

1. **Criar Campanha**:
   ```bash
   POST /api/v1/campaigns
   {
     "name": "Promoção Black Friday",
     "type": "broadcast",
     "message": "🎉 Ofertas especiais!",
     "channelId": "channel-id"
   }
   ```

2. **Adicionar Alvos**:
   ```bash
   POST /api/v1/campaigns/{id}/targets
   {
     "contactIds": ["contact-1", "contact-2"]
   }
   ```

3. **Iniciar Campanha**:
   ```bash
   POST /api/v1/campaigns/{id}/start
   ```

4. **Acompanhar Progresso**: Conectar ao WebSocket namespace `/campaigns` e escutar eventos `campaign.progress`

### Importação de CSV

Para importar contatos em massa:

1. **Formato CSV**:
   ```csv
   name,phone
   João Silva,+5511999999999
   Maria Santos,+5511888888888
   ```

2. **API de Importação**:
   ```bash
   POST /api/v1/contacts/import
   Content-Type: multipart/form-data
   file: [arquivo CSV]
   ```

3. **Validação**: Sistema valida formato de telefone e duplicatas

### Providers WhatsApp

#### WhatsApp Cloud API (Recomendado)
- Configurar no Meta Developer Console
- Webhook automático para status de entrega
- Rate limiting gerenciado pela Meta

#### Baileys (Alternativo)
- Sessões persistentes em arquivo/Redis
- QR Code para conexão
- Controle total sobre conexão

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
pnpm run test

# Testes de integração
pnpm run test:integration

# Testes E2E
pnpm run test:e2e

# Cobertura
pnpm run test:cov
```

### Cobertura Mínima
- **Auth Module**: ≥80%
- **Campaigns Module**: ≥80%
- **Messaging Module**: ≥80%

## 📈 Monitoramento

### Health Checks
- `/health` - Status geral da aplicação
- `/health/db` - Status do banco de dados
- `/health/redis` - Status do Redis

### Logs
- Estruturados com Pino
- Níveis: debug, info, warn, error
- Contexto de tenant e usuário

### Métricas
- Contadores de campanhas por status
- Taxa de sucesso de envios
- Tempo médio de execução
- Opt-out rates

## 🔒 Segurança

### Autenticação
- JWT com TTL configurável
- Refresh tokens com rotação
- Argon2 para hash de senhas

### Autorização
- RBAC baseado em roles
- Middleware de multitenancy
- Validação de entrada com class-validator

### Rate Limiting
- Global: 100 req/min por IP
- Campanhas: Configurável por canal
- WebSocket: Limite de conexões por tenant

## 🚀 Deploy

### Variáveis de Ambiente Obrigatórias

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Redis
REDIS_URL=rediss://default:token@host:port

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# WhatsApp (opcional)
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_ACCESS_TOKEN=your-access-token
```

### Docker (Opcional)

```bash
# Build da imagem
docker build -t atendechat-api .

# Executar container
docker run -p 8080:8080 --env-file .env atendechat-api
```

## 📚 Documentação

- **API**: Swagger em `/api/docs`
- **Frontend**: `FRONTEND_SPECS.md`
- **Campanhas**: `FRONTEND_CAMPANHAS_SPECS.md`
- **WebSocket**: Eventos documentados nos gateways

## 🤝 Contribuição

1. Fork do repositório
2. Criar branch para feature
3. Implementar com testes
4. Executar linting e testes
5. Abrir Pull Request

## 📄 Licença

MIT License - ver arquivo LICENSE para detalhes.

## 🆘 Suporte

- **Issues**: GitHub Issues
- **Documentação**: README e arquivos de especificação
- **Testes**: Verificar cobertura e executar suite completa

---

**Status**: ✅ Fase 1 completa - Sistema de campanhas funcional com todos os recursos implementados.
