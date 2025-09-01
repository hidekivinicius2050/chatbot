# 🧠 IA de Atendimento - AtendeChat

Implementação completa de funcionalidades de IA para melhorar o atendimento ao cliente, incluindo Base de Conhecimento, Sugestões de Resposta, Sumários Automáticos e Auto-tagging.

## ✨ Funcionalidades Implementadas

### 🔍 **Base de Conhecimento (KB)**
- **Modelos Prisma**: `KnowledgeBase`, `KBArticle`, `KBChunk`
- **Busca Semântica**: Usando pgvector para embeddings
- **Gestão de Conteúdo**: CRUD de artigos com Markdown
- **Reindexação**: Processo automático de chunking e embeddings

### 💡 **Sugestões de Resposta**
- **Contexto Inteligente**: Baseado na mensagem do cliente e KB
- **3 Sugestões**: Respostas educadas e práticas
- **Confiança**: Score de relevância para cada sugestão
- **Copiar/Colar**: Integração fácil com o chat

### 📝 **Sumários Automáticos**
- **Resumo Estruturado**: 5-7 bullets com fatos, sentimento, pendências
- **Atualização em Tempo Real**: Após processamento dos jobs
- **Histórico**: Mantém evolução do ticket

### 🏷️ **Auto-tagging e Sentimento**
- **Classificação Automática**: Até 3 tags relevantes
- **Análise de Sentimento**: Positive/Neutral/Negative
- **Priorização**: Ajuda na gestão de tickets

## 🏗️ **Arquitetura**

### **Banco de Dados**
```sql
-- Habilitar pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Modelos principais
KnowledgeBase (empresa, nome, descrição)
KBArticle (título, conteúdo Markdown, tags, status)
KBChunk (conteúdo, embedding, tokenCount)
TicketInsights (sumário, sentimento, tags)
```

### **Worker Jobs (BullMQ)**
- `kb:chunk` → Quebra artigos em chunks e gera embeddings
- `ai:summarize` → Gera sumários de tickets
- `ai:autotag` → Classifica sentimento e tags
- `ai:suggest-replies` → Sugestões baseadas na KB

### **API Endpoints**
```
GET    /api/v1/kb                    # Listar KBs
POST   /api/v1/kb                    # Criar KB
GET    /api/v1/kb/:kbId/articles     # Listar artigos
POST   /api/v1/kb/:kbId/articles     # Criar artigo
PATCH  /api/v1/kb/articles/:id       # Atualizar artigo
DELETE /api/v1/kb/articles/:id       # Deletar artigo
POST   /api/v1/kb/articles/:id/reindex # Reindexar

POST   /api/v1/tickets/:id/summarize # Gerar sumário
POST   /api/v1/tickets/:id/autotag   # Auto-tagging
POST   /api/v1/tickets/:id/suggest   # Sugestões
GET    /api/v1/tickets/:id/insights  # Insights do ticket
```

### **Frontend**
- `/settings/ai` → Configurações de IA
- `/knowledge-base` → Gestão da KB
- Painel lateral IA no chat → Sugestões, sumário, tags

## 🚀 **Como Rodar**

### **1. Preparar Banco (pgvector)**
```bash
# No Neon SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### **2. Aplicar Migrações**
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### **3. Executar Seeds**
```bash
npx prisma db seed
# Cria KB padrão com 5 artigos de exemplo
```

### **4. Configurar Variáveis de Ambiente**
```bash
# apps/web/.env.local
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_CHAT_MODEL=gpt-4o-mini
AI_EMBED_MODEL=text-embedding-3-small
AI_MAX_TOKENS_PER_DAY=200000
AI_ENABLE_SUMMARIZE=true
AI_ENABLE_SUGGESTIONS=true
AI_ENABLE_AUTOTAG=true
PGVECTOR_ENABLED=true
```

### **5. Subir Aplicação**
```bash
pnpm -w dev
```

## 🧪 **Testes**

### **Unit Tests**
```bash
# Testar chunking e limites
pnpm --filter @atendechat/api test

# Testar prompts e validações
pnpm --filter @atendechat/core test
```

### **Integration Tests**
```bash
# Testar reindexação e busca
pnpm --filter @atendechat/api test:integration

# Testar endpoints de IA
pnpm --filter @atendechat/api test:e2e
```

### **E2E Tests**
```bash
# Testar fluxo completo
pnpm --filter @atendechat/web test:e2e

# Cenários: criar artigo → reindexar → usar sugestões
```

## 📊 **Monitoramento**

### **Métricas de Uso**
- Tokens consumidos por dia
- Taxa de acerto das sugestões
- Tempo de resposta da IA
- Custo por tenant

### **Logs de Segurança**
- PII redaction (dados sensíveis removidos)
- Custos agregados (não conteúdo dos prompts)
- Limites respeitados por empresa

## 🔒 **Segurança e Privacidade**

### **PII Redaction**
- Detecção automática de dados sensíveis
- Remoção antes do envio para IA
- Logs limpos de informações pessoais

### **Controle por Tenant**
- Limites diários configuráveis
- Isolamento completo entre empresas
- Configurações independentes

### **Auditoria**
- Log de todas as operações de IA
- Rastreamento de custos
- Histórico de uso por usuário

## 🎯 **Critérios de Aceitação**

### **Funcionalidade**
- [x] Criar/editar artigos → Reindexar gera chunks + embeddings
- [x] Sugestões coerentes em < 3s (dev)
- [x] Sumário aparece após job e atualiza
- [x] Auto-tagging/sentimento visível como badges
- [x] Limites de uso e privacidade respeitados

### **Qualidade**
- [x] Testes unitários passando
- [x] Testes de integração funcionando
- [x] E2E mínimos implementados
- [x] Documentação completa

## 🔮 **Próximos Passos**

### **Curto Prazo**
- Implementar feedback loop de qualidade
- Adicionar mais modelos de IA (Claude, Gemini)
- Melhorar prompts com exemplos específicos

### **Médio Prazo**
- Análise de tendências e insights
- Recomendações personalizadas por agente
- Integração com CRM externo

### **Longo Prazo**
- IA conversacional para atendimento 24/7
- Análise preditiva de tickets
- Otimização automática de processos

## 📁 **Estrutura de Arquivos**

```
├── apps/api/prisma/
│   ├── schema.prisma          # Modelos KB + IA
│   ├── seed.ts               # Seeds com artigos exemplo
│   └── migrations/           # SQL para pgvector
├── apps/web/src/
│   ├── app/[locale]/
│   │   ├── settings/ai/      # Configurações de IA
│   │   └── knowledge-base/   # Gestão da KB
│   └── components/tickets/
│       └── ai-panel.tsx      # Painel lateral IA
├── packages/core/
│   └── prompts/              # Templates de prompts
└── IA_ATENDIMENTO_README.md  # Esta documentação
```

## 🤝 **Contribuição**

Para contribuir com melhorias na IA:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** com testes
4. **Abra** um Pull Request

## 📞 **Suporte**

- **Issues**: GitHub Issues
- **Documentação**: Este README
- **Comunidade**: Discord/Slack (em breve)

---

**AtendeChat IA** - Transformando atendimento com inteligência artificial 🤖✨
