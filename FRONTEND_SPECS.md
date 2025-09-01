# 📱 Especificações do Frontend - Passo 4: WhatsApp Providers

Este documento descreve como o frontend deve ser desenvolvido para as funcionalidades de WhatsApp implementadas no backend.

## 🎯 Visão Geral

O frontend deve fornecer uma interface completa para:
- Gerenciamento de canais WhatsApp
- Envio de mensagens
- Monitoramento de status de conexão
- Geração de QR codes (Baileys)
- Configuração de webhooks
- Dashboard de atividade

## 🏗️ Estrutura de Componentes

### 1. **WhatsAppProviderManager** (Componente Principal)
```typescript
// Componente principal para gerenciar providers WhatsApp
interface WhatsAppProviderManagerProps {
  companyId: string;
  onChannelUpdate: (channel: Channel) => void;
}
```

**Funcionalidades:**
- Lista de canais configurados
- Status de conectividade em tempo real
- Botões de ação (conectar, desconectar, configurar)
- Indicadores visuais de status

**Estados:**
- `channels: Channel[]` - Lista de canais
- `loading: boolean` - Estado de carregamento
- `error: string | null` - Mensagens de erro

### 2. **ChannelCard** (Card de Canal)
```typescript
interface ChannelCardProps {
  channel: Channel;
  onStatusUpdate: (status: string) => void;
  onConfigure: (config: any) => void;
}
```

**Funcionalidades:**
- Exibir informações do canal (nome, tipo, status)
- Indicador visual de status (conectado/desconectado)
- Botões de ação contextuais
- Badge de tipo de provider

**Estados:**
- `isConnected: boolean` - Status de conexão
- `isConfiguring: boolean` - Modo de configuração
- `lastActivity: Date` - Última atividade

### 3. **WhatsAppCloudConfig** (Configuração Cloud API)
```typescript
interface WhatsAppCloudConfigProps {
  channelId: string;
  currentConfig?: any;
  onSave: (config: WhatsAppCloudConfig) => void;
}
```

**Campos do Formulário:**
- `accessToken: string` - Token de acesso da Meta
- `phoneNumberId: string` - ID do número de telefone
- `appId: string` - ID da aplicação Meta
- `appSecret: string` - Segredo da aplicação
- `verifyToken: string` - Token de verificação
- `webhookSecret: string` - Segredo do webhook

**Validações:**
- Campos obrigatórios
- Formato de token
- Teste de conectividade
- Validação de permissões

**Estados:**
- `isConnecting: boolean` - Tentativa de conexão
- `connectionStatus: 'idle' | 'connecting' | 'connected' | 'error'`
- `validationErrors: Record<string, string>`

### 4. **BaileysQRCode** (Geração de QR Code)
```typescript
interface BaileysQRCodeProps {
  channelId: string;
  onConnectionStatusChange: (status: string) => void;
}
```

**Funcionalidades:**
- Exibir QR code gerado
- Contador de tempo para expiração
- Status de conexão em tempo real
- Botão para regenerar QR code
- Instruções para escanear

**Estados:**
- `qrCode: string` - Data URL do QR code
- `isGenerating: boolean` - Gerando QR code
- `timeRemaining: number` - Tempo restante (segundos)
- `connectionStatus: 'idle' | 'generating' | 'waiting' | 'connected' | 'expired'`

**WebSocket Events:**
- `qr.generated` - QR code gerado
- `connection.ready` - Conexão estabelecida
- `connection.closed` - Conexão fechada

### 5. **MessageSender** (Envio de Mensagens)
```typescript
interface MessageSenderProps {
  ticketId: string;
  onMessageSent: (message: Message) => void;
}
```

**Campos do Formulário:**
- `body: string` - Conteúdo da mensagem
- `type: 'text' | 'image' | 'file'` - Tipo de mensagem
- `mediaUrl?: string` - URL da mídia (opcional)
- `mediaType?: string` - Tipo de mídia (opcional)

**Funcionalidades:**
- Editor de texto rico
- Upload de arquivos/mídia
- Preview da mensagem
- Validação em tempo real
- Histórico de mensagens enviadas

**Estados:**
- `isSending: boolean` - Enviando mensagem
- `sendStatus: 'idle' | 'sending' | 'sent' | 'error'`
- `validationErrors: Record<string, string>`

### 6. **WebhookMonitor** (Monitoramento de Webhooks)
```typescript
interface WebhookMonitorProps {
  companyId: string;
}
```

**Funcionalidades:**
- Status de conectividade do webhook
- Última verificação realizada
- Configurações atuais
- Estatísticas de uso
- Logs de erro recentes

**Estados:**
- `webhookStatus: 'configured' | 'not_configured' | 'error'`
- `lastVerification: Date` - Última verificação
- `messageCount: number` - Contador de mensagens
- `errorCount: number` - Contador de erros

### 7. **WhatsAppDashboard** (Dashboard Principal)
```typescript
interface WhatsAppDashboardProps {
  companyId: string;
}
```

**Métricas Exibidas:**
- Total de canais configurados
- Canais conectados vs desconectados
- Mensagens enviadas hoje
- Mensagens recebidas hoje
- Status dos webhooks
- Últimas atividades

**Gráficos:**
- Volume de mensagens por dia
- Status de conectividade ao longo do tempo
- Distribuição por tipo de mensagem

## 🔄 Estados e Fluxos

### Fluxo de Conexão WhatsApp Cloud
1. **Configuração Inicial**
   - Usuário preenche formulário de configuração
   - Validação dos campos obrigatórios
   - Teste de conectividade

2. **Processo de Conexão**
   - Envio das configurações para o backend
   - Indicador de "conectando..."
   - Verificação de status
   - Atualização do estado do canal

3. **Pós-Conexão**
   - Exibição de status "conectado"
   - Botões de desconectar/reconectar
   - Monitoramento contínuo de status

### Fluxo de Conexão Baileys
1. **Geração do QR Code**
   - Solicitação de QR code ao backend
   - Exibição do código em tempo real
   - Início do contador de expiração

2. **Processo de Conexão**
   - Usuário escaneia QR code
   - WebSocket recebe eventos de status
   - Atualização do estado de conexão

3. **Conexão Estabelecida**
   - QR code é removido
   - Status atualizado para "conectado"
   - Monitoramento contínuo

### Fluxo de Envio de Mensagens
1. **Composição**
   - Usuário preenche formulário
   - Validação em tempo real
   - Preview da mensagem

2. **Envio**
   - Submissão para o backend
   - Indicador de progresso
   - Confirmação de envio

3. **Pós-Envio**
   - Mensagem adicionada ao histórico
   - Status de entrega (se disponível)
   - Opção de reenvio em caso de falha

## 🎨 Design e UX

### Indicadores Visuais
- **Status de Conexão:**
  - 🟢 Verde: Conectado
  - 🔴 Vermelho: Desconectado
  - 🟡 Amarelo: Conectando
  - ⚪ Cinza: Não configurado

- **Status de Mensagem:**
  - 📤 Enviando
  - ✅ Enviado
  - ❌ Erro
  - 🔄 Reenviando

### Feedback em Tempo Real
- **Toast Notifications** para ações importantes
- **Progress Bars** para operações longas
- **Loading States** para todas as operações assíncronas
- **Error Boundaries** para tratamento de erros

### Responsividade
- **Mobile First** design
- **Adaptive Layout** para diferentes tamanhos de tela
- **Touch Friendly** para dispositivos móveis
- **Keyboard Navigation** para desktop

## 🔌 Integração com APIs

### Endpoints Utilizados
```typescript
// Canais
GET    /api/v1/channels
POST   /api/v1/channels
GET    /api/v1/channels/:id
PATCH  /api/v1/channels/:id
DELETE /api/v1/channels/:id

// Status de Canais
GET    /api/v1/channels/:id/status
POST   /api/v1/channels/:id/connect/cloud
GET    /api/v1/channels/:id/qrcode

// Mensagens
POST   /api/v1/messaging/send

// Webhooks
GET    /api/v1/webhooks/whatsapp/status
```

### WebSocket Events
```typescript
// Eventos de conexão
socket.on('channel.connected', (data) => {});
socket.on('channel.disconnected', (data) => {});
socket.on('qr.generated', (data) => {});
socket.on('connection.ready', (data) => {});

// Eventos de mensagem
socket.on('message.sent', (data) => {});
socket.on('message.delivered', (data) => {});
socket.on('message.failed', (data) => {});

// Eventos de webhook
socket.on('webhook.received', (data) => {});
socket.on('webhook.error', (data) => {});
```

## 🧪 Testes e Validação

### Testes de Componente
- Renderização correta dos estados
- Interações do usuário
- Validações de formulário
- Tratamento de erros

### Testes de Integração
- Comunicação com APIs
- WebSocket connections
- Upload de arquivos
- Validação de dados

### Testes E2E
- Fluxo completo de configuração
- Envio de mensagens
- Conexão via QR code
- Tratamento de cenários de erro

## 📱 Implementação Recomendada

### Tecnologias
- **Framework:** Next.js 15 + React 18
- **UI Library:** shadcn/ui + Tailwind CSS
- **State Management:** Zustand ou Context API
- **Form Handling:** React Hook Form + Zod
- **WebSocket:** Socket.IO Client
- **File Upload:** React Dropzone
- **QR Code:** qrcode.react

### Estrutura de Arquivos
```
components/
├── whatsapp/
│   ├── WhatsAppProviderManager.tsx
│   ├── ChannelCard.tsx
│   ├── WhatsAppCloudConfig.tsx
│   ├── BaileysQRCode.tsx
│   ├── MessageSender.tsx
│   ├── WebhookMonitor.tsx
│   └── WhatsAppDashboard.tsx
├── ui/
│   ├── StatusIndicator.tsx
│   ├── ConnectionStatus.tsx
│   ├── QRCodeDisplay.tsx
│   └── MessagePreview.tsx
└── forms/
    ├── ChannelConfigForm.tsx
    └── MessageForm.tsx
```

### Hooks Customizados
```typescript
// useWhatsAppChannels
const { channels, loading, error, updateChannel } = useWhatsAppChannels(companyId);

// useChannelStatus
const { status, isConnected, refreshStatus } = useChannelStatus(channelId);

// useWebSocket
const { isConnected, sendMessage, lastMessage } = useWebSocket(url, token);

// useMessageSender
const { sendMessage, isSending, sendStatus } = useMessageSender();
```

## 🚀 Próximos Passos

1. **Implementar componentes base** (StatusIndicator, ConnectionStatus)
2. **Criar formulários de configuração** (ChannelConfigForm, MessageForm)
3. **Implementar gerenciamento de estado** (Zustand stores)
4. **Adicionar WebSocket integration** (Socket.IO client)
5. **Implementar upload de arquivos** (React Dropzone)
6. **Adicionar validações** (React Hook Form + Zod)
7. **Implementar testes** (Jest + Testing Library)
8. **Adicionar animações** (Framer Motion)

## 📚 Recursos Adicionais

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
