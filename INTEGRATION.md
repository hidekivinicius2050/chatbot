# Integração Frontend-Backend - AtendeChat 2.0

## Visão Geral

Este documento descreve como o frontend Next.js se integra com o backend NestJS para criar uma plataforma completa de atendimento ao cliente.

## Arquitetura

```
Frontend (Next.js) ←→ API Service Layer ←→ Backend (NestJS)
     ↓                    ↓                    ↓
  React Hooks        Axios + WebSocket    REST + WebSocket
  Context API        Interceptors         Controllers
  Real-time UI       Error Handling       Services
```

## Componentes de Integração

### 1. Serviço de API (`/src/services/api.ts`)

**Responsabilidades:**
- Configuração centralizada do Axios
- Interceptors para autenticação e tratamento de erros
- Tipos TypeScript para todas as entidades
- Serviços específicos para cada funcionalidade

**Funcionalidades:**
- ✅ Autenticação JWT
- ✅ Tratamento automático de erros 401
- ✅ Timeout configurável por ambiente
- ✅ Headers automáticos

**Exemplo de uso:**
```typescript
import { ticketsService } from '@/services/api'

// Carregar tickets
const tickets = await ticketsService.getAll()

// Criar novo ticket
const newTicket = await ticketsService.create({
  title: 'Novo problema',
  description: 'Descrição do problema',
  priority: 'high'
})
```

### 2. Contexto Global (`/src/contexts/AppContext.tsx`)

**Responsabilidades:**
- Estado global da aplicação
- Gerenciamento de dados em tempo real
- Hooks específicos para cada entidade
- Integração com serviços de API

**Hooks disponíveis:**
- `useTickets()` - Gerenciamento de tickets
- `useCampaigns()` - Gerenciamento de campanhas
- `useChannels()` - Gerenciamento de canais
- `useFlows()` - Gerenciamento de fluxos
- `useTemplates()` - Gerenciamento de templates
- `useConversations()` - Gerenciamento de conversas
- `useAIConfig()` - Configurações de IA

**Exemplo de uso:**
```typescript
import { useTickets } from '@/contexts/AppContext'

function TicketList() {
  const { tickets, loading, error, loadTickets } = useTickets()
  
  useEffect(() => {
    loadTickets()
  }, [])
  
  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>
  
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}
```

### 3. WebSocket em Tempo Real (`/src/hooks/useWebSocket.ts`)

**Responsabilidades:**
- Conexão WebSocket com o backend
- Reconexão automática
- Hooks específicos para chat e notificações
- Gerenciamento de estado de conexão

**Hooks disponíveis:**
- `useWebSocket()` - WebSocket genérico
- `useChatWebSocket()` - WebSocket para chat
- `useNotificationsWebSocket()` - WebSocket para notificações

**Exemplo de uso:**
```typescript
import { useChatWebSocket } from '@/hooks/useWebSocket'

function ChatInterface({ conversationId }: { conversationId: string }) {
  const { 
    isConnected, 
    messages, 
    typing, 
    sendMessage, 
    sendTyping 
  } = useChatWebSocket(conversationId)
  
  const handleSend = (content: string) => {
    sendMessage(content)
  }
  
  return (
    <div>
      <div>Status: {isConnected ? 'Conectado' : 'Desconectado'}</div>
      {messages.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
      <MessageInput onSend={handleSend} />
    </div>
  )
}
```

### 4. Sistema de Notificações (`/src/components/ui/notifications.tsx`)

**Responsabilidades:**
- Notificações em tempo real
- Toast notifications
- Integração com WebSocket
- Interface de usuário para notificações

**Componentes disponíveis:**
- `NotificationBell` - Sino de notificações
- `ToastContainer` - Container de toasts
- `showToast()` - Função para mostrar toasts

**Exemplo de uso:**
```typescript
import { showToast } from '@/components/ui/notifications'

// Mostrar toast de sucesso
showToast({
  type: 'success',
  title: 'Sucesso!',
  message: 'Ticket criado com sucesso'
})

// Mostrar toast de erro
showToast({
  type: 'error',
  title: 'Erro',
  message: 'Falha ao criar ticket'
})
```

## Configuração de Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env.local` na pasta `apps/web/`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# App Configuration
NEXT_PUBLIC_APP_NAME=AtendeChat 2.0
NEXT_PUBLIC_APP_VERSION=2.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_WHATSAPP=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### Configuração Automática

O sistema detecta automaticamente o ambiente e aplica configurações apropriadas:

- **Development**: Timeouts menores, mais tentativas de reconexão, modo debug
- **Production**: Timeouts maiores, menos tentativas de reconexão, modo otimizado

## Endpoints da API

### Autenticação
- `POST /api/v1/auth/login` - Login do usuário
- `POST /api/v1/auth/logout` - Logout do usuário
- `GET /api/v1/auth/profile` - Perfil do usuário

### Tickets
- `GET /api/v1/tickets` - Listar tickets
- `GET /api/v1/tickets/:id` - Obter ticket específico
- `POST /api/v1/tickets` - Criar ticket
- `PATCH /api/v1/tickets/:id` - Atualizar ticket
- `DELETE /api/v1/tickets/:id` - Deletar ticket

### Campanhas
- `GET /api/v1/campaigns` - Listar campanhas
- `GET /api/v1/campaigns/:id` - Obter campanha específica
- `POST /api/v1/campaigns` - Criar campanha
- `PATCH /api/v1/campaigns/:id` - Atualizar campanha
- `DELETE /api/v1/campaigns/:id` - Deletar campanha
- `POST /api/v1/campaigns/:id/start` - Iniciar campanha
- `POST /api/v1/campaigns/:id/pause` - Pausar campanha

### Canais
- `GET /api/v1/channels` - Listar canais
- `GET /api/v1/channels/:id` - Obter canal específico
- `POST /api/v1/channels` - Criar canal
- `PATCH /api/v1/channels/:id` - Atualizar canal
- `DELETE /api/v1/channels/:id` - Deletar canal
- `GET /api/v1/channels/:id/qrcode` - Obter QR code
- `POST /api/v1/channels/:id/connect` - Conectar canal

### Fluxos
- `GET /api/v1/flows` - Listar fluxos
- `GET /api/v1/flows/:id` - Obter fluxo específico
- `POST /api/v1/flows` - Criar fluxo
- `PATCH /api/v1/flows/:id` - Atualizar fluxo
- `DELETE /api/v1/flows/:id` - Deletar fluxo
- `POST /api/v1/flows/:id/activate` - Ativar fluxo
- `POST /api/v1/flows/:id/pause` - Pausar fluxo

### Templates
- `GET /api/v1/templates` - Listar templates
- `GET /api/v1/templates/:id` - Obter template específico
- `POST /api/v1/templates` - Criar template
- `PATCH /api/v1/templates/:id` - Atualizar template
- `DELETE /api/v1/templates/:id` - Deletar template
- `PATCH /api/v1/templates/:id/toggle` - Alternar ativo/inativo

### Chat
- `GET /api/v1/chat/conversations` - Listar conversas
- `GET /api/v1/chat/conversations/:id/messages` - Obter mensagens
- `POST /api/v1/chat/conversations/:id/messages` - Enviar mensagem
- `PATCH /api/v1/chat/conversations/:id/read` - Marcar como lida
- `PATCH /api/v1/chat/conversations/:id/resolve` - Resolver conversa
- `PATCH /api/v1/chat/conversations/:id/archive` - Arquivar conversa

### IA e WhatsApp
- `GET /api/v1/ai-config` - Obter configurações de IA
- `PATCH /api/v1/ai-config` - Atualizar configurações de IA
- `POST /api/v1/ai-config/test` - Testar conexão
- `POST /api/v1/ai-config/generate` - Gerar resposta

### Mensagens
- `POST /api/v1/messaging/send` - Enviar mensagem
- `POST /api/v1/messaging/send-bulk` - Enviar mensagem em massa

## WebSocket Events

### Chat Events
- `new_message` - Nova mensagem recebida
- `typing_start` - Usuário começou a digitar
- `typing_stop` - Usuário parou de digitar
- `message_status` - Status da mensagem atualizado
- `conversation_update` - Conversa atualizada

### Notification Events
- `new_notification` - Nova notificação
- `notification_read` - Notificação marcada como lida
- `notification_clear` - Todas as notificações limpas

## Tratamento de Erros

### Erros de API
- **401 Unauthorized**: Redirecionamento automático para login
- **403 Forbidden**: Exibição de mensagem de permissão
- **404 Not Found**: Exibição de página 404 personalizada
- **500 Internal Server Error**: Exibição de mensagem de erro genérica

### Erros de WebSocket
- Reconexão automática com backoff exponencial
- Máximo de tentativas configurável por ambiente
- Fallback para polling HTTP se WebSocket falhar

## Monitoramento e Debug

### Logs de Desenvolvimento
- Todas as requisições API são logadas no console
- Status de conexão WebSocket é exibido
- Erros são logados com stack trace completo

### Logs de Produção
- Logs de erro são enviados para serviço de monitoramento
- Métricas de performance são coletadas
- Alertas automáticos para falhas críticas

## Segurança

### Autenticação
- Tokens JWT armazenados em localStorage
- Refresh automático de tokens expirados
- Logout automático em caso de erro 401

### Validação
- Todos os dados de entrada são validados
- Sanitização de HTML e scripts maliciosos
- Rate limiting para APIs sensíveis

## Performance

### Otimizações
- Lazy loading de componentes
- Debouncing de inputs de busca
- Virtualização de listas longas
- Cache de dados em contexto

### Métricas
- Tempo de resposta da API
- Latência de WebSocket
- Tempo de carregamento de páginas
- Uso de memória e CPU

## Próximos Passos

### Integrações Planejadas
- [ ] Sistema de cache Redis
- [ ] Upload de arquivos
- [ ] Integração com WhatsApp Business API
- [ ] Sistema de relatórios avançados
- [ ] Dashboard de analytics em tempo real

### Melhorias de UX
- [ ] Skeleton loading states
- [ ] Error boundaries
- [ ] Offline support
- [ ] PWA capabilities
- [ ] Multi-language support

## Suporte

Para dúvidas sobre integração:
1. Verifique os logs do console
2. Teste os endpoints individualmente
3. Verifique a configuração de ambiente
4. Consulte a documentação da API
5. Entre em contato com a equipe de desenvolvimento
