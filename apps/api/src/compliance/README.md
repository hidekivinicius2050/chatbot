# Módulo de Compliance

Este módulo implementa funcionalidades de conformidade com regulamentações de privacidade e proteção de dados, incluindo LGPD (Lei Geral de Proteção de Dados) e GDPR.

## Funcionalidades

### 1. Gestão de Consentimento
- **Registro de consentimento**: Captura consentimentos do usuário para diferentes tipos de processamento
- **Histórico de consentimento**: Mantém registro completo de todas as mudanças de consentimento
- **Verificação de consentimento válido**: Verifica se o usuário tem consentimento ativo para um tipo específico

### 2. Direitos do Titular dos Dados (DSR)
- **Solicitações de DSR**: Permite que usuários solicitem acesso, correção, exclusão ou portabilidade de dados
- **Status de solicitações**: Acompanha o progresso das solicitações (solicitado, em andamento, concluído)
- **Prevenção de duplicatas**: Evita múltiplas solicitações pendentes do mesmo tipo

### 3. Política de Retenção
- **Configuração por plano**: Diferentes períodos de retenção baseados no plano da empresa
- **Limpeza automática**: Remove ou anonimiza dados expirados conforme política
- **Auditoria de limpeza**: Registra todas as operações de limpeza para fins de auditoria

### 4. Auditoria e Logs
- **Log de eventos**: Registra todas as ações relacionadas à compliance
- **Rastreabilidade**: Mantém histórico completo de mudanças e ações
- **Metadados**: Captura IP, User-Agent e outras informações relevantes

## Endpoints

### Consentimento
- `POST /api/v1/compliance/consent` - Registrar consentimento
- `GET /api/v1/compliance/consent` - Histórico de consentimentos
- `GET /api/v1/compliance/consent/:kind` - Verificar consentimento específico

### DSR
- `POST /api/v1/compliance/dsr` - Criar solicitação DSR
- `GET /api/v1/compliance/dsr` - Listar solicitações DSR
- `GET /api/v1/compliance/dsr/:id` - Obter detalhes de uma solicitação

### Retenção
- `GET /api/v1/compliance/retention` - Obter política de retenção
- `POST /api/v1/compliance/retention/cleanup` - Executar limpeza de dados

### Resumo
- `GET /api/v1/compliance/summary` - Resumo geral de compliance

### Endpoints Públicos
- `POST /api/v1/compliance/public/consent` - Consentimento público (sem autenticação)
- `POST /api/v1/compliance/public/dsr` - DSR público (sem autenticação)

## Configuração

### Variáveis de Ambiente
```bash
# Políticas de retenção (em dias)
COMPLIANCE_FREE_RETENTION_DAYS=30
COMPLIANCE_PRO_RETENTION_DAYS=90
COMPLIANCE_BUSINESS_RETENTION_DAYS=365

# Configurações de DSR
COMPLIANCE_DSR_MAX_PENDING=10
COMPLIANCE_DSR_AUTO_APPROVAL=false

# Configurações de consentimento
COMPLIANCE_REQUIRE_EXPLICIT_CONSENT=true
COMPLIANCE_COOKIE_BANNER_ENABLED=true
```

## Uso

### Exemplo de Registro de Consentimento
```typescript
// Registrar consentimento para marketing
const consent = await complianceService.recordConsent('company123', {
  kind: 'MARKETING',
  accepted: true,
  userId: 'user456',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});
```

### Exemplo de Verificação de Consentimento
```typescript
// Verificar se usuário tem consentimento para marketing
const hasConsent = await complianceService.hasValidConsent(
  'company123',
  'MARKETING',
  'user456'
);
```

### Exemplo de Solicitação DSR
```typescript
// Solicitar acesso aos dados
const dsrRequest = await complianceService.createDsrRequest('company123', {
  kind: 'ACCESS',
  requesterEmail: 'user@example.com',
  reason: 'Verificar dados pessoais armazenados'
});
```

## Estrutura do Banco de Dados

### ConsentEvent
- `id`: Identificador único
- `companyId`: ID da empresa
- `kind`: Tipo de consentimento (MARKETING, ANALYTICS, NECESSARY)
- `accepted`: Se o consentimento foi aceito
- `userId`: ID do usuário (opcional)
- `ip`: Endereço IP do usuário
- `userAgent`: User-Agent do navegador
- `createdAt`: Data de criação

### DsrRequest
- `id`: Identificador único
- `companyId`: ID da empresa
- `kind`: Tipo de solicitação (ACCESS, RECTIFICATION, ERASURE, PORTABILITY)
- `requesterEmail`: Email do solicitante
- `status`: Status da solicitação (REQUESTED, IN_PROGRESS, COMPLETED, REJECTED)
- `reason`: Motivo da solicitação (opcional)
- `resultPath`: Caminho para o resultado (opcional)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

## Segurança

- **Autenticação**: Todos os endpoints protegidos requerem JWT válido
- **Autorização**: Verificação de acesso à empresa através do CompanyGuard
- **Auditoria**: Todas as ações são registradas para fins de auditoria
- **Validação**: Validação rigorosa de dados de entrada
- **Rate Limiting**: Proteção contra abuso através de rate limiting

## Monitoramento

- **Logs estruturados**: Todos os eventos são registrados com contexto completo
- **Métricas**: Contadores para eventos de compliance
- **Alertas**: Notificações para ações críticas (ex: tentativas de acesso não autorizado)

## Conformidade

Este módulo foi projetado para atender aos requisitos de:
- **LGPD (Lei Geral de Proteção de Dados)** - Brasil
- **GDPR (General Data Protection Regulation)** - União Europeia
- **CCPA (California Consumer Privacy Act)** - Califórnia, EUA

## Contribuição

Para contribuir com este módulo:
1. Siga os padrões de código estabelecidos
2. Adicione testes para novas funcionalidades
3. Atualize a documentação conforme necessário
4. Verifique a conformidade com regulamentações aplicáveis

