const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Atendechat API',
    version: '1.0.0'
  });
});

// Channels API
app.get('/channels', (req, res) => {
  const mockChannels = [
    {
      id: 'channel-1',
      name: 'WhatsApp Business',
      type: 'whatsapp',
      status: 'connected',
      phoneNumber: '+55 11 99999-9999',
      businessName: 'Minha Empresa',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      lastActivity: new Date().toISOString(),
      config: {
        phoneNumber: '+55 11 99999-9999',
        businessName: 'Minha Empresa'
      }
    },
    {
      id: 'channel-2',
      name: 'Telegram Bot',
      type: 'telegram',
      status: 'connected',
      apiKey: 'bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
      lastActivity: new Date().toISOString(),
      config: {
        apiKey: 'bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
      }
    },
    {
      id: 'channel-3',
      name: 'Email Support',
      type: 'email',
      status: 'connected',
      email: 'suporte@empresa.com',
      lastActivity: new Date().toISOString(),
      config: {
        email: 'suporte@empresa.com'
      }
    },
    {
      id: 'channel-4',
      name: 'WhatsApp Teste',
      type: 'whatsapp',
      status: 'disconnected',
      phoneNumber: '+55 11 88888-8888',
      businessName: 'Empresa Teste',
      lastActivity: null,
      config: {
        phoneNumber: '+55 11 88888-8888',
        businessName: 'Empresa Teste'
      }
    }
  ];

  res.json({
    items: mockChannels,
    nextCursor: null,
    hasNextPage: false
  });
});

app.get('/channels/:id', (req, res) => {
  const { id } = req.params;
  
  const mockChannel = {
    id: id,
    name: 'WhatsApp Business',
    type: 'whatsapp',
    status: 'connected',
    phoneNumber: '+55 11 99999-9999',
    businessName: 'Minha Empresa',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    lastActivity: new Date().toISOString(),
    config: {
      phoneNumber: '+55 11 99999-9999',
      businessName: 'Minha Empresa'
    }
  };

  res.json(mockChannel);
});

app.get('/channels/:id/qrcode', (req, res) => {
  res.json({
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  });
});

app.post('/channels/:id/connect', (req, res) => {
  res.json({
    success: true,
    message: 'Canal conectado com sucesso'
  });
});

app.get('/channels/:id/status', (req, res) => {
  res.json({
    status: 'connected'
  });
});

app.get('/channels/:id/stats', (req, res) => {
  res.json({
    channelId: req.params.id,
    totalMessages: 1250,
    sentMessages: 800,
    receivedMessages: 450,
    uniqueContacts: 120,
    avgResponseTime: '2m 30s',
    uptime: '99.9%',
    lastActivity: new Date().toISOString(),
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    dailyStats: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      messages: Math.floor(Math.random() * 100) + 20
    }))
  });
});

// Campaigns API
app.get('/campaigns', (req, res) => {
  const mockCampaigns = [
    {
      id: 'campaign-1',
      name: 'Campanha de Boas-vindas',
      description: 'Campanha para novos usuários',
      status: 'active',
      type: 'marketing',
      targetAudience: ['novos-usuarios'],
      createdAt: '2024-01-01T00:00:00Z',
      completedAt: '2024-12-31T23:59:59Z',
      budget: 5000,
      sentCount: 150
    },
    {
      id: 'campaign-2',
      name: 'Promoção Black Friday',
      description: 'Campanha promocional para Black Friday',
      status: 'completed',
      type: 'promotional',
      targetAudience: ['clientes-ativos'],
      createdAt: '2024-11-01T00:00:00Z',
      completedAt: '2024-11-30T23:59:59Z',
      budget: 10000,
      sentCount: 500
    }
  ];

  res.json({
    campaigns: mockCampaigns
  });
});

// Flows API
app.get('/flows', (req, res) => {
  const mockFlows = [
    {
      id: 'flow-1',
      name: 'Fluxo de Boas-vindas',
      description: 'Fluxo automático para novos usuários',
      status: 'active',
      steps: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'flow-2',
      name: 'Fluxo de Suporte',
      description: 'Fluxo para atendimento ao cliente',
      status: 'active',
      steps: 8,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  res.json(mockFlows);
});

// Templates API
app.get('/templates', (req, res) => {
  const mockTemplates = [
    {
      id: 'template-1',
      name: 'Boas-vindas',
      content: 'Olá! Bem-vindo à nossa empresa. Como podemos ajudá-lo hoje?',
      category: 'welcome',
      tags: ['boas-vindas', 'inicial'],
      variables: ['nome', 'empresa'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template-2',
      name: 'Horário de Funcionamento',
      content: 'Nosso horário de funcionamento é de segunda a sexta, das 9h às 18h. Estamos aqui para ajudar!',
      category: 'business-hours',
      tags: ['horário', 'funcionamento'],
      variables: [],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  res.json(mockTemplates);
});

// Chat API
app.get('/chat/conversations', (req, res) => {
  const mockConversations = [
    {
      id: 'conv-1',
      contactName: 'João Silva',
      contactPhone: '+55 11 99999-9999',
      lastMessage: 'Olá, preciso de ajuda com meu pedido',
      lastMessageTime: new Date().toISOString(),
      status: 'open',
      unreadCount: 2,
      channel: 'whatsapp'
    },
    {
      id: 'conv-2',
      contactName: 'Maria Santos',
      contactPhone: '+55 11 88888-8888',
      lastMessage: 'Obrigada pelo atendimento!',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'resolved',
      unreadCount: 0,
      channel: 'telegram'
    }
  ];

  res.json({
    data: mockConversations
  });
});

// Auth API
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  res.json({
    success: true,
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: 'user_1',
      email,
      name: 'Usuário Teste',
      role: 'ADMIN'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Atendechat API está funcionando!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      channels: '/channels',
      campaigns: '/campaigns',
      flows: '/flows',
      templates: '/templates',
      chat: '/chat/conversations',
      auth: '/auth/login'
    },
    documentation: 'Sistema de chatbot com módulo de compliance LGPD'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /channels',
      'GET /channels/:id',
      'GET /campaigns',
      'GET /flows',
      'GET /templates',
      'GET /chat/conversations',
      'POST /auth/login'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Atendechat API com Channels iniciada com sucesso!');
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Channels: http://localhost:${PORT}/channels`);
  console.log(`📋 Campaigns: http://localhost:${PORT}/campaigns`);
  console.log(`🔄 Flows: http://localhost:${PORT}/flows`);
  console.log(`📝 Templates: http://localhost:${PORT}/templates`);
  console.log(`💬 Chat: http://localhost:${PORT}/chat/conversations`);
  console.log(`🔐 Auth: http://localhost:${PORT}/auth/login`);
  console.log('');
  console.log('🎯 Sistema 100% funcional para testes!');
  console.log('📝 Use os endpoints acima para testar as funcionalidades.');
});
