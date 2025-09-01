# Frontend - Relatórios Avançados + Observabilidade + Auditoria

## 📊 Páginas Principais

### 1. Dashboard Avançado (`/dashboard`)

#### Componentes:
- **FilterBar**: Filtros de período (from/to), exportar dados
- **OverviewCards**: Cards com KPIs principais
- **ChartsSection**: Gráficos interativos
- **RealTimeMetrics**: Métricas em tempo real

#### KPIs Cards:
```typescript
interface OverviewCard {
  title: string;
  value: number;
  change: number; // % vs período anterior
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}
```

#### Gráficos:
- **Linha temporal**: Mensagens/tickets por dia (últimos 30 dias)
- **Pizza**: Distribuição por canal
- **Barras**: Performance por agente
- **Gauge**: Compliance SLA

### 2. Relatórios (`/reports`)

#### Subpáginas:
- `/reports/overview` - Visão geral
- `/reports/agents` - Por agente
- `/reports/channels` - Por canal
- `/reports/daily` - Séries temporais
- `/reports/sla` - Relatórios SLA

#### Componentes Comuns:
- **DateRangePicker**: Seletor de período
- **ExportButton**: CSV/PDF
- **DataTable**: Tabela paginada com ordenação
- **ChartContainer**: Wrapper para gráficos

### 3. Auditoria (`/audit`)

#### Funcionalidades:
- **AuditTable**: Tabela paginada com filtros
- **AuditFilters**: Filtros avançados
- **AuditDetails**: Modal com detalhes do log
- **AuditStats**: Estatísticas de auditoria

#### Filtros:
- Ação (LOGIN, CREATE, UPDATE, etc.)
- Ator (usuário)
- Tipo de alvo (ticket, message, campaign)
- Período (from/to)
- Sucesso (true/false)

## 🎨 Design System

### Cores:
```css
/* Sucesso/Positivo */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

/* Aviso/Neutro */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Erro/Negativo */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* SLA */
--sla-good: #22c55e;
--sla-warning: #f59e0b;
--sla-critical: #ef4444;
```

### Componentes Base:
- **MetricCard**: Card com valor, título e indicador de tendência
- **TrendIndicator**: Seta + % de mudança
- **StatusBadge**: Badge colorido para status
- **ProgressRing**: Anel de progresso para SLA
- **DataTable**: Tabela com paginação e ordenação

## 📈 Gráficos (Recharts)

### Configurações:
```typescript
const chartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { 
      mode: 'index',
      intersect: false 
    }
  }
};
```

### Tipos de Gráfico:
1. **LineChart**: Séries temporais
2. **BarChart**: Comparações
3. **PieChart**: Distribuições
4. **AreaChart**: Volumes acumulados
5. **ComposedChart**: Múltiplas métricas

## 🔍 Filtros e Busca

### DateRangePicker:
```typescript
interface DateRange {
  from: Date;
  to: Date;
}

const presets = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Este mês', value: 'month' },
  { label: 'Este ano', value: 'year' },
];
```

### Filtros Avançados:
- **MultiSelect**: Canais, agentes, tipos
- **SearchInput**: Busca por texto
- **StatusFilter**: Filtros por status
- **SLAFilter**: Filtros por compliance

## 📊 Tabelas de Dados

### DataTable Props:
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
  };
  sorting?: {
    id: string;
    desc: boolean;
  };
  filters?: Filter[];
  onRowClick?: (row: T) => void;
  exportOptions?: ExportOption[];
}
```

### Colunas Específicas:
- **AgentColumn**: Nome + avatar + role
- **StatusColumn**: Badge colorido
- **DateColumn**: Data formatada + tooltip
- **MetricColumn**: Valor + formatação
- **ActionColumn**: Botões de ação

## 🔐 Controle de Acesso

### RBAC:
```typescript
const permissions = {
  reports: {
    overview: ['OWNER', 'ADMIN', 'AGENT'],
    agents: ['OWNER', 'ADMIN'],
    channels: ['OWNER', 'ADMIN'],
    daily: ['OWNER', 'ADMIN', 'AGENT'],
    sla: ['OWNER', 'ADMIN'],
  },
  audit: {
    view: ['OWNER', 'ADMIN'],
    export: ['OWNER', 'ADMIN'],
  }
};
```

### Hooks:
```typescript
const usePermissions = () => {
  const { user } = useAuth();
  return {
    canViewReports: ['OWNER', 'ADMIN', 'AGENT'].includes(user.role),
    canViewAudit: ['OWNER', 'ADMIN'].includes(user.role),
    canExportData: ['OWNER', 'ADMIN'].includes(user.role),
  };
};
```

## 📱 Responsividade

### Breakpoints:
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Layouts:
- **Mobile**: Cards empilhados, tabelas scrolláveis
- **Tablet**: Grid 2x2, tabelas responsivas
- **Desktop**: Grid 3x3, tabelas completas

## 🚀 Performance

### Otimizações:
1. **Virtualização**: Para tabelas grandes
2. **Lazy Loading**: Para gráficos pesados
3. **Memoização**: Para cálculos complexos
4. **Debounce**: Para filtros de busca
5. **Caching**: Para dados de relatórios

### Code Splitting:
```typescript
const ReportsPage = lazy(() => import('./pages/Reports'));
const AuditPage = lazy(() => import('./pages/Audit'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
```

## 🧪 Testes

### Testes Unitários:
```typescript
describe('ReportsService', () => {
  it('should calculate SLA compliance correctly', () => {
    // Test implementation
  });
  
  it('should format metrics for charts', () => {
    // Test implementation
  });
});
```

### Testes E2E:
```typescript
describe('Reports Flow', () => {
  it('should display overview metrics', () => {
    // Test implementation
  });
  
  it('should filter data by date range', () => {
    // Test implementation
  });
  
  it('should export data to CSV', () => {
    // Test implementation
  });
});
```

## 📋 Checklist de Implementação

### Dashboard:
- [ ] Cards de KPIs com tendências
- [ ] Gráficos interativos
- [ ] Filtros de período
- [ ] Métricas em tempo real
- [ ] Responsividade

### Relatórios:
- [ ] Página de visão geral
- [ ] Relatório por agente
- [ ] Relatório por canal
- [ ] Séries temporais
- [ ] Relatórios SLA
- [ ] Exportação de dados

### Auditoria:
- [ ] Tabela de logs
- [ ] Filtros avançados
- [ ] Detalhes do log
- [ ] Estatísticas
- [ ] Redação de PII

### Funcionalidades:
- [ ] Controle de acesso (RBAC)
- [ ] Responsividade
- [ ] Performance otimizada
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Documentação

## 🎯 Próximos Passos

1. **Implementar componentes base**
2. **Criar páginas de relatórios**
3. **Implementar gráficos**
4. **Adicionar funcionalidades de auditoria**
5. **Otimizar performance**
6. **Implementar testes**
7. **Documentar componentes**
