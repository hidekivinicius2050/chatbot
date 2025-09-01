# Especificações Frontend - Sistema de Campanhas

## 📋 Visão Geral

Este documento descreve as especificações para o desenvolvimento do frontend do sistema de campanhas (envio em massa) do Atendechat 2.0.

## 🎯 Funcionalidades Principais

### 1. Gestão de Campanhas
- **Criação**: Formulário para criar novas campanhas
- **Edição**: Modificação de campanhas existentes
- **Listagem**: Visualização paginada com filtros
- **Ações**: Iniciar, pausar, retomar, finalizar, cancelar
- **Exclusão**: Remoção de campanhas (com confirmação)

### 2. Gestão de Alvos
- **Adição**: Seleção de contatos para campanhas
- **Visualização**: Lista de alvos por campanha
- **Status**: Acompanhamento de envios (pending, sent, failed, opt_out)

### 3. Sistema de Opt-out
- **Gerenciamento**: Adicionar/remover opt-outs
- **Histórico**: Log de opt-outs por contato/canal
- **Respeito**: Não enviar para contatos com opt-out

### 4. Relatórios e Analytics
- **Dashboard**: Métricas em tempo real
- **Relatórios**: Diários, por campanha, resumidos
- **Exportação**: Dados para análise externa

## 🏗️ Estrutura de Componentes

### Páginas Principais
```
/campaigns
├── /campaigns                    # Lista de campanhas
├── /campaigns/new               # Criação de campanha
├── /campaigns/[id]              # Detalhes da campanha
├── /campaigns/[id]/edit         # Edição da campanha
├── /campaigns/[id]/targets      # Gestão de alvos
├── /campaigns/[id]/stats        # Estatísticas
├── /campaigns/opt-outs          # Gestão de opt-outs
└── /campaigns/reports           # Relatórios
```

### Componentes Reutilizáveis
```
components/campaigns/
├── CampaignForm.tsx             # Formulário de criação/edição
├── CampaignList.tsx             # Lista paginada de campanhas
├── CampaignCard.tsx             # Card individual da campanha
├── CampaignActions.tsx          # Botões de ação (iniciar, pausar, etc.)
├── CampaignStats.tsx            # Métricas da campanha
├── TargetSelector.tsx           # Seleção de contatos alvo
├── TargetList.tsx               # Lista de alvos da campanha
├── OptOutManager.tsx            # Gestão de opt-outs
├── CampaignReports.tsx          # Geração de relatórios
└── CampaignDashboard.tsx        # Dashboard principal
```

## 🎨 Design e UX

### Paleta de Cores
- **Primária**: Azul corporativo (#2563eb)
- **Sucesso**: Verde (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)
- **Neutro**: Cinza (#6b7280)

### Estados Visuais
- **Draft**: Cinza claro com ícone de rascunho
- **Scheduled**: Azul com ícone de calendário
- **Running**: Verde com indicador de progresso
- **Paused**: Amarelo com ícone de pausa
- **Completed**: Verde escuro com ícone de check
- **Cancelled**: Vermelho com ícone de X

### Indicadores de Progresso
- **Barra de Progresso**: Mostrar % de envios concluídos
- **Contadores**: Total, enviados, falharam, opt-outs
- **Tempo Estimado**: Baseado no rate-limit configurado

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações Mobile
- Cards empilhados verticalmente
- Ações em menu dropdown
- Formulários em modal fullscreen
- Navegação por tabs

## 🔄 Estados e Loading

### Estados de Loading
- **Skeleton**: Para listas e cards
- **Spinner**: Para ações individuais
- **Progress Bar**: Para operações longas

### Estados de Erro
- **Toast**: Para erros simples
- **Modal**: Para erros críticos
- **Fallback**: Para falhas de carregamento

### Estados de Sucesso
- **Toast**: Para ações bem-sucedidas
- **Feedback Visual**: Mudanças imediatas na UI
- **Confirmação**: Para ações destrutivas

## 📊 Dados e Estado

### Estado Global (Zustand/Redux)
```typescript
interface CampaignsState {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  loading: boolean;
  error: string | null;
  filters: CampaignFilters;
  pagination: PaginationState;
}
```

### Cache e Sincronização
- **SWR/React Query**: Para dados de campanhas
- **WebSocket**: Para atualizações em tempo real
- **Optimistic Updates**: Para ações rápidas
- **Background Sync**: Para dados offline

## 🚀 Performance

### Lazy Loading
- **Code Splitting**: Por rota de campanhas
- **Virtual Scrolling**: Para listas grandes de alvos
- **Infinite Scroll**: Para paginação de campanhas

### Otimizações
- **Debounce**: Para filtros de busca
- **Memoização**: Para componentes pesados
- **Prefetch**: Para navegação comum

## 🔐 Segurança e Validação

### Validação de Formulários
- **Zod**: Para validação de schemas
- **React Hook Form**: Para gerenciamento de estado
- **Validação em Tempo Real**: Para campos obrigatórios

### Controle de Acesso
- **RBAC**: Verificar permissões antes de mostrar ações
- **Guards**: Proteger rotas sensíveis
- **Audit Log**: Registrar ações importantes

## 📡 Integração com API

### Endpoints Principais
```typescript
// Campanhas
GET    /api/v1/campaigns          # Listar campanhas
POST   /api/v1/campaigns          # Criar campanha
GET    /api/v1/campaigns/:id      # Buscar campanha
PATCH  /api/v1/campaigns/:id      # Atualizar campanha
DELETE /api/v1/campaigns/:id      # Remover campanha

// Ações de campanha
POST   /api/v1/campaigns/:id/start    # Iniciar campanha
POST   /api/v1/campaigns/:id/pause    # Pausar campanha
POST   /api/v1/campaigns/:id/resume   # Retomar campanha
POST   /api/v1/campaigns/:id/finish   # Finalizar campanha
POST   /api/v1/campaigns/:id/cancel   # Cancelar campanha

// Alvos
POST   /api/v1/campaigns/:id/targets  # Adicionar alvos
GET    /api/v1/campaigns/:id/stats    # Estatísticas

// Opt-outs
POST   /api/v1/campaigns/opt-out      # Adicionar opt-out
DELETE /api/v1/campaigns/opt-out/:contactId/:channelId
GET    /api/v1/campaigns/opt-out      # Listar opt-outs

// Relatórios
GET    /api/v1/campaigns/reports      # Gerar relatórios
```

### Tratamento de Erros
- **HTTP Status**: Mapear códigos para mensagens amigáveis
- **Retry Logic**: Para falhas temporárias
- **Fallback**: Para serviços indisponíveis

## 🧪 Testes

### Testes Unitários
- **Jest**: Para lógica de negócio
- **React Testing Library**: Para componentes
- **MSW**: Para mock de API

### Testes E2E
- **Playwright**: Para fluxos completos
- **Cenários**: Criação, envio, relatórios
- **Cross-browser**: Chrome, Firefox, Safari

## 📈 Métricas e Analytics

### Eventos de Tracking
- **Campanha Criada**: Nome, tipo, alvos
- **Campanha Iniciada**: ID, timestamp
- **Campanha Finalizada**: Duração, sucesso
- **Opt-out**: Motivo, fonte

### KPIs Principais
- **Taxa de Abertura**: % de mensagens entregues
- **Taxa de Sucesso**: % de envios bem-sucedidos
- **Tempo de Execução**: Duração média das campanhas
- **Opt-out Rate**: % de contatos que cancelaram

## 🚀 Roadmap de Funcionalidades

### Fase 1 (MVP)
- ✅ CRUD básico de campanhas
- ✅ Gestão de alvos
- ✅ Sistema de opt-out
- ✅ Relatórios básicos

### Fase 2 (Melhorias)
- 📅 Templates de campanha
- 📅 Segmentação avançada
- 📅 A/B Testing
- 📅 Automação de campanhas

### Fase 3 (Avançado)
- 📅 Machine Learning para otimização
- 📅 Integração com CRMs
- 📅 Analytics avançados
- 📅 API para terceiros

## 📚 Recursos e Referências

### Bibliotecas Recomendadas
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: Zustand ou Redux Toolkit
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts ou Chart.js
- **Tabelas**: TanStack Table
- **Notificações**: Sonner ou React Hot Toast

### Padrões de Código
- **TypeScript**: Tipagem estrita
- **ESLint**: Linting consistente
- **Prettier**: Formatação automática
- **Husky**: Git hooks para qualidade

### Documentação
- **Storybook**: Para componentes
- **JSDoc**: Para funções complexas
- **README**: Para setup e uso
- **Changelog**: Para versões

## 🎯 Critérios de Aceitação

### Funcionalidade
- ✅ Criar campanha com 50+ alvos
- ✅ Iniciar e acompanhar progresso
- ✅ Rate-limit respeitado
- ✅ Opt-out funcionando
- ✅ Relatórios gerados
- ✅ Isolamento entre tenants

### Performance
- ✅ Lista carrega em < 2s
- ✅ Ações respondem em < 500ms
- ✅ Suporte a 1000+ campanhas
- ✅ Funciona offline básico

### UX/UI
- ✅ Design responsivo
- ✅ Feedback visual claro
- ✅ Tratamento de erros
- ✅ Acessibilidade básica

### Segurança
- ✅ Validação de entrada
- ✅ Controle de acesso
- ✅ Sanitização de dados
- ✅ Logs de auditoria

---

**Nota**: Este documento deve ser atualizado conforme o desenvolvimento avança e novos requisitos são identificados.
