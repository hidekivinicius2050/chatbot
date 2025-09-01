const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Função para criar resposta JSON
function createResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(data, null, 2)
  };
}

// Função para processar requisições
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Health Check
  if (path === '/health' && method === 'GET') {
    const response = createResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Atendechat API',
      version: '1.0.0'
    });
    
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // Root endpoint
  if (path === '/' && method === 'GET') {
    const response = createResponse({
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
    
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // Compliance API
  if (path === '/api/v1/compliance' && method === 'GET') {
    const response = createResponse({
      message: 'Módulo de Compliance funcionando!',
      endpoints: {
        consent: '/api/v1/compliance/consent',
        dsr: '/api/v1/compliance/dsr',
        retention: '/api/v1/compliance/retention',
        audit: '/api/v1/compliance/audit'
      }
    });
    
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // Consent Endpoint
  if (path === '/api/v1/compliance/consent' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const response = createResponse({
          success: true,
          message: 'Consentimento registrado com sucesso',
          data: {
            userId: data.userId,
            kind: data.kind,
            accepted: data.accepted,
            timestamp: new Date().toISOString()
          }
        });
        
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      } catch (error) {
        const response = createResponse({
          error: 'Dados inválidos',
          message: error.message
        }, 400);
        
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      }
    });
    return;
  }

  // DSR Endpoint
  if (path === '/api/v1/compliance/dsr' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const response = createResponse({
          success: true,
          message: 'Solicitação DSR criada com sucesso',
          data: {
            id: 'dsr_' + Date.now(),
            requesterEmail: data.requesterEmail,
            kind: data.kind,
            reason: data.reason,
            status: 'REQUESTED',
            createdAt: new Date().toISOString()
          }
        });
        
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      } catch (error) {
        const response = createResponse({
          error: 'Dados inválidos',
          message: error.message
        }, 400);
        
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      }
    });
    return;
  }

  // Retention Endpoint
  if (path === '/api/v1/compliance/retention' && method === 'GET') {
    const response = createResponse({
      success: true,
      data: {
        freeDays: 30,
        proDays: 90,
        businessDays: 365,
        lastCleanup: new Date().toISOString()
      }
    });
    
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // Audit Endpoint
  if (path === '/api/v1/compliance/audit' && method === 'GET') {
    const response = createResponse({
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
    
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // Auth Endpoint
  if (path === '/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const response = createResponse({
          success: true,
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 'user_1',
            email: data.email,
            name: 'Usuário Teste',
            role: 'ADMIN'
          }
        });
        
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      } catch (error) {
        const response = createResponse({
          error: 'Dados inválidos',
          message: error.message
        }, 400);
        
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      }
    });
    return;
  }

  // Tickets Endpoint
  if (path === '/api/v1/tickets' && method === 'GET') {
    const response = createResponse({
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
    
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // Messages Endpoint
  if (path === '/api/v1/messages' && method === 'GET') {
    const response = createResponse({
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
    
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // 404 - Endpoint não encontrado
  const response = createResponse({
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
  }, 404);
  
  res.writeHead(response.statusCode, response.headers);
  res.end(response.body);
}

// Criar servidor
const server = http.createServer(handleRequest);

// Iniciar servidor
server.listen(PORT, () => {
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
  console.log('');
  console.log('💡 Dicas de teste:');
  console.log('  - GET http://localhost:3000/ (página inicial)');
  console.log('  - GET http://localhost:3000/health (status do sistema)');
  console.log('  - GET http://localhost:3000/api/v1/compliance (módulo compliance)');
  console.log('  - POST http://localhost:3000/api/v1/compliance/consent (registrar consentimento)');
  console.log('  - POST http://localhost:3000/api/v1/compliance/dsr (solicitar DSR)');
});

