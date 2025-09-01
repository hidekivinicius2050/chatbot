# Frontend - Automações + SLA + Business Hours + Roteamento

## Resumo Executivo

Este documento especifica a implementação frontend para o sistema de automações, SLA, horário de atendimento e roteamento de tickets. O frontend será desenvolvido em Next.js 15 com React 18, utilizando shadcn/ui e Tailwind CSS.

## Funcionalidades Principais

### 1. Configurações de Horário de Atendimento

#### Página: `/settings/business-hours`

**Componente Principal:** `BusinessHoursForm`

```typescript
interface BusinessHoursFormProps {
  initialData?: {
    timezone: string;
    weeklyJson: WeeklySchedule;
  };
  onSave: (data: UpdateBusinessHoursDto) => Promise<void>;
}

interface WeeklySchedule {
  mon?: DaySchedule | null;
  tue?: DaySchedule | null;
  wed?: DaySchedule | null;
  thu?: DaySchedule | null;
  fri?: DaySchedule | null;
  sat?: DaySchedule | null;
  sun?: DaySchedule | null;
}

interface DaySchedule {
  start: string; // HH:MM
  end: string;   // HH:MM
}
```

**Funcionalidades:**
- Seletor de timezone (dropdown com timezones comuns)
- Grade semanal com toggles para cada dia
- Campos de hora início/fim para cada dia ativo
- Validação: hora fim > hora início
- Preview do horário configurado
- Botão "Aplicar configuração padrão" (seg-sex 08:00-18:00)

**UI/UX:**
- Cards para cada dia da semana
- Toggle switch para ativar/desativar dia
- Time picker nativo ou customizado
- Indicador visual de dias ativos/inativos
- Preview em formato legível

### 2. Configurações de SLA

#### Página: `/settings/sla`

**Componente Principal:** `SlaForm`

```typescript
interface SlaFormProps {
  initialData?: {
    firstResponseMins: number;
    resolutionMins: number;
  };
  onSave: (data: UpdateSlaDto) => Promise<void>;
}
```

**Funcionalidades:**
- Campo numérico para "Primeira resposta (minutos)"
- Campo numérico para "Resolução (minutos)"
- Validação: valores > 0
- Preview do tempo em formato legível
- Exemplos de cenários (ex: 15min = 1/4 hora)

**UI/UX:**
- Cards informativos com exemplos
- Input numérico com step de 5 minutos
- Preview em tempo real
- Tooltips explicativos

### 3. Gestão de Automações

#### Página: `/automations`

**Lista de Automações:**
- Tabela com: Nome, Status, Última execução, Ações
- Filtros: Status (Ativo/Inativo), Tipo
- Paginação
- Busca por nome

**Componente:** `AutomationsTable`

```typescript
interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  dsl: AutomationDsl;
  createdAt: Date;
  updatedAt: Date;
  runs: AutomationRun[];
}

interface AutomationRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  finishedAt?: Date;
  error?: string;
}
```

#### Página: `/automations/new` e `/automations/[id]/edit`

**Editor de Automações:**

**Componente Principal:** `AutomationEditor`

```typescript
interface AutomationEditorProps {
  automation?: Automation;
  onSave: (data: CreateAutomationDto | UpdateAutomationDto) => Promise<void>;
  onTest?: (eventMock: any) => Promise<TestResult>;
}
```

**Funcionalidades:**

1. **Configuração Básica:**
   - Nome da automação
   - Toggle ativo/inativo
   - Descrição (opcional)

2. **Editor Visual de Fluxo:**
   - Interface drag-and-drop para criar fluxos
   - Nós para triggers, conditions, actions
   - Conexões visuais entre nós
   - Validação em tempo real

3. **Triggers (Gatilhos):**
   - Lista de triggers disponíveis
   - Configuração de filtros
   - Preview do trigger

4. **Conditions (Condições):**
   - Operadores: keywordAny, keywordAll, channelType, firstContact, outsideBusinessHours, contactTagIncludes
   - Interface para configurar cada operador
   - Validação de sintaxe

5. **Actions (Ações):**
   - Lista de ações disponíveis
   - Configuração de parâmetros
   - Preview da ação

6. **Teste de Automação:**
   - Botão "Testar Automação"
   - Modal para configurar evento mock
   - Resultado do teste com ações que seriam executadas

**UI/UX:**
- Interface visual tipo "flow builder"
- Drag-and-drop para reorganizar
- Validação visual (nós verdes/vermelhos)
- Preview em tempo real
- Auto-save
- Histórico de versões

### 4. Relatórios de SLA

#### Página: `/reports/sla`

**Componente Principal:** `SlaReports`

```typescript
interface SlaReport {
  period: string;
  slaConfig: {
    firstResponseMins: number;
    resolutionMins: number;
  };
  totalTickets: number;
  firstResponseCompliance: number; // %
  resolutionCompliance: number;    // %
  avgFirstResponseTime: number;    // minutos
  avgResolutionTime: number;       // minutos
  firstResponseBreaches: number;
  resolutionBreaches: number;
}
```

**Funcionalidades:**

1. **Resumo Geral:**
   - Cards com KPIs principais
   - Gráficos de compliance
   - Comparação com período anterior

2. **Relatório Diário:**
   - Seletor de período (from/to)
   - Tabela de breaches por dia
   - Gráficos de tendência

3. **Detalhamento:**
   - Lista de tickets com SLA vencido
   - Filtros por tipo de breach
   - Export para CSV

**UI/UX:**
- Dashboard com cards de métricas
- Gráficos interativos (Chart.js ou similar)
- Tabelas com paginação
- Filtros avançados
- Export de dados

### 5. Tickets com SLA

#### Página: `/tickets`

**Melhorias no componente existente:**

1. **Badge de SLA:**
   - Indicador visual de tempo restante
   - Cores: verde (ok), amarelo (atenção), vermelho (vencido)
   - Tooltip com detalhes

2. **Ações de Atribuição:**
   - Botão "Atribuir para mim"
   - Botão "Repassar" (abre modal de seleção)
   - Dropdown com agentes disponíveis

3. **Notificações em Tempo Real:**
   - Toast notifications para SLA breaches
   - Notificações de atribuição
   - Badge de notificações não lidas

**Componente:** `TicketSlaBadge`

```typescript
interface TicketSlaBadgeProps {
  ticket: Ticket & {
    sla?: TicketSla;
  };
  onAssign?: (userId: string) => Promise<void>;
}
```

### 6. WebSocket Events

**Integração com Socket.IO:**

```typescript
// Eventos a serem implementados
socket.on('ticket.assigned', (data: {
  ticketId: string;
  assignedUserId: string;
}) => {
  // Atualizar lista de tickets
  // Mostrar toast notification
});

socket.on('ticket.sla.breached', (data: {
  ticketId: string;
  type: 'first_response' | 'resolution';
  dueAt: Date;
}) => {
  // Atualizar badge de SLA
  // Mostrar toast de alerta
});

socket.on('automation.fired', (data: {
  automationId: string;
  actions: string[];
  target: { ticketId?: string; contactId?: string };
}) => {
  // Log de automação executada
  // Atualizar contadores
});
```

## Componentes Reutilizáveis

### 1. `TimeZoneSelect`
- Dropdown com timezones
- Busca integrada
- Agrupamento por região

### 2. `DayScheduleCard`
- Card para configurar horário de um dia
- Toggle ativo/inativo
- Time picker
- Validação visual

### 3. `AutomationNode`
- Nó visual para triggers/conditions/actions
- Drag-and-drop
- Configuração inline
- Validação visual

### 4. `SlaBadge`
- Badge com tempo restante
- Cores baseadas no status
- Tooltip com detalhes

### 5. `AgentSelector`
- Dropdown com agentes disponíveis
- Busca por nome
- Indicador de carga de trabalho

## Estrutura de Arquivos

```
apps/web/src/
├── app/
│   ├── settings/
│   │   ├── business-hours/
│   │   │   └── page.tsx
│   │   └── sla/
│   │       └── page.tsx
│   ├── automations/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       ├── edit/
│   │       │   └── page.tsx
│   │       └── page.tsx
│   └── reports/
│       └── sla/
│           └── page.tsx
├── components/
│   ├── automations/
│   │   ├── automation-editor.tsx
│   │   ├── automation-node.tsx
│   │   ├── automation-table.tsx
│   │   └── test-automation-modal.tsx
│   ├── settings/
│   │   ├── business-hours-form.tsx
│   │   ├── day-schedule-card.tsx
│   │   ├── sla-form.tsx
│   │   └── timezone-select.tsx
│   ├── reports/
│   │   ├── sla-reports.tsx
│   │   └── sla-summary-cards.tsx
│   └── shared/
│       ├── sla-badge.tsx
│       └── agent-selector.tsx
└── lib/
    ├── hooks/
    │   ├── use-automations.ts
    │   ├── use-sla-reports.ts
    │   └── use-business-hours.ts
    └── utils/
        ├── automation-helpers.ts
        ├── sla-calculations.ts
        └── timezone-helpers.ts
```

## Estados e Gerenciamento

### Zustand Stores

```typescript
// stores/automations.ts
interface AutomationsStore {
  automations: Automation[];
  loading: boolean;
  error: string | null;
  fetchAutomations: () => Promise<void>;
  createAutomation: (data: CreateAutomationDto) => Promise<void>;
  updateAutomation: (id: string, data: UpdateAutomationDto) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  testAutomation: (id: string, eventMock: any) => Promise<TestResult>;
}

// stores/sla.ts
interface SlaStore {
  slaConfig: SlaConfig | null;
  slaReports: SlaReport[];
  loading: boolean;
  fetchSlaConfig: () => Promise<void>;
  updateSlaConfig: (data: UpdateSlaDto) => Promise<void>;
  fetchSlaReports: (from: string, to: string) => Promise<void>;
}
```

## Validações

### Frontend Validation (Zod)

```typescript
// schemas/automation.ts
const automationDslSchema = z.object({
  triggers: z.array(z.object({
    type: z.string(),
    filters: z.record(z.any()).optional(),
  })),
  conditions: z.array(z.object({
    if: z.record(z.any()),
  })),
  actions: z.array(z.object({
    type: z.string(),
    // Validações específicas por tipo
  })),
});

// schemas/business-hours.ts
const dayScheduleSchema = z.object({
  start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
}).refine(data => data.end > data.start, {
  message: "Hora fim deve ser maior que hora início",
});
```

## Testes

### Componentes
- Testes unitários para cada componente
- Testes de integração para formulários
- Testes de validação

### E2E
- Fluxo completo de criação de automação
- Configuração de horário de atendimento
- Teste de relatórios de SLA

## Considerações de Performance

1. **Lazy Loading:**
   - Carregar editor de automações sob demanda
   - Paginação em listas grandes

2. **Caching:**
   - Cache de configurações de SLA/Business Hours
   - Cache de automações por empresa

3. **Otimizações:**
   - Debounce em campos de busca
   - Virtualização em listas grandes
   - Memoização de componentes pesados

## Acessibilidade

1. **ARIA Labels:**
   - Labels apropriados para todos os controles
   - Descrições para elementos complexos

2. **Navegação por Teclado:**
   - Suporte completo a Tab/Enter/Escape
   - Atalhos de teclado para ações comuns

3. **Contraste:**
   - Cores com contraste adequado
   - Indicadores visuais + textuais

## Responsividade

1. **Mobile First:**
   - Layout adaptativo para mobile
   - Touch-friendly controls

2. **Breakpoints:**
   - sm: 640px (mobile)
   - md: 768px (tablet)
   - lg: 1024px (desktop)
   - xl: 1280px (large desktop)

## Internacionalização

1. **i18n:**
   - Suporte a português e inglês
   - Formatação de datas/horas por locale
   - Tradução de mensagens de erro

2. **Formatação:**
   - Timezones locais
   - Formatação de números
   - Calendários locais
