const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Compliance API - Simulada
app.get('/api/v1/compliance', (req, res) => {
  res.json({
    message: 'Módulo de Compliance funcionando!',
    endpoints: {
      consent: '/api/v1/compliance/consent',
      dsr: '/api/v1/compliance/dsr',
      retention: '/api/v1/compliance/retention',
      audit: '/api/v1/compliance/audit'
    }
  });
});

// Consent Endpoint
app.post('/api/v1/compliance/consent', (req, res) => {
  const { userId, kind, accepted } = req.body;
  
  res.json({
    success: true,
    message: 'Consentimento registrado com sucesso',
    data: {
      userId,
      kind,
      accepted,
      timestamp: new Date().toISOString()
    }
  });
});

// DSR Endpoint
app.post('/api/v1/compliance/dsr', (req, res) => {
  const { requesterEmail, kind, reason } = req.body;
  
  res.json({
    success: true,
    message: 'Solicitação DSR criada com sucesso',
    data: {
      id: 'dsr_' + Date.now(),
      requesterEmail,
      kind,
      reason,
      status: 'REQUESTED',
      createdAt: new Date().toISOString()
    }
  });
});

// Retention Endpoint
app.get('/api/v1/compliance/retention', (req, res) => {
  res.json({
    success: true,
    data: {
      freeDays: 30,
      proDays: 90,
      businessDays: 365,
      lastCleanup: new Date().toISOString()
    }
  });
});

// Audit Endpoint
app.get('/api/v1/compliance/audit', (req, res) => {
  res.json({
    success: true,
    data: {
      events: [
        {
          id: 'audit_1',
          action: 'CONSENT_RECORDED',
          targetType: 'consent',
          timestamp: new Date().toISOString()
        },
        {
          id: 'audit_2',
          action: 'DSR_REQUESTED',
          targetType: 'dsr',
          timestamp: new Date().toISOString()
        }
      ]
    }
  });
});

// Auth Endpoint (simulado)
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

// Tickets Endpoint (simulado)
app.get('/api/v1/tickets', (req, res) => {
  res.json({
    success: true,
    data: {
      tickets: [
        {
          id: 'ticket_1',
          status: 'open',
          priority: 'medium',
          subject: 'Problema com login',
          createdAt: new Date().toISOString()
        }
      ]
    }
  });
});

// Messages Endpoint (simulado)
app.get('/api/v1/messages', (req, res) => {
  res.json({
    success: true,
    data: {
      messages: [
        {
          id: 'msg_1',
          body: 'Olá, como posso ajudar?',
          direction: 'outbound',
          createdAt: new Date().toISOString()
        }
      ]
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
      compliance: '/api/v1/compliance',
      auth: '/auth/login',
      tickets: '/api/v1/tickets',
      messages: '/api/v1/messages'
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
      'GET /api/v1/compliance',
      'POST /api/v1/compliance/consent',
      'POST /api/v1/compliance/dsr',
      'GET /api/v1/compliance/retention',
      'GET /api/v1/compliance/audit',
      'POST /auth/login',
      'GET /api/v1/tickets',
      'GET /api/v1/messages'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Atendechat API iniciada com sucesso!');
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Compliance API: http://localhost:${PORT}/api/v1/compliance`);
  console.log(`🔐 Auth: http://localhost:${PORT}/auth/login`);
  console.log(`📋 Tickets: http://localhost:${PORT}/api/v1/tickets`);
  console.log(`💬 Messages: http://localhost:${PORT}/api/v1/messages`);
  console.log('');
  console.log('🎯 Sistema 100% funcional para testes!');
  console.log('📝 Use os endpoints acima para testar as funcionalidades.');
});

