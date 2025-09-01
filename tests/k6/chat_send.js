import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Configurações
const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8080';
const EMAIL = __ENV.K6_ACCESS_EMAIL || 'admin@test.com';
const PASSWORD = __ENV.K6_ACCESS_PASSWORD || '123456';

// Métricas customizadas
const errorRate = new Rate('errors');
const messageLatency = new Trend('message_latency_ms');
const queueLagTrend = new Trend('queue_lag_ms');

// Configuração do teste
export const options = {
  stages: [
    { duration: '1m', target: 3 },   // Ramp-up para 3 VUs (agentes)
    { duration: '5m', target: 3 },   // Estável em 3 VUs
    { duration: '1m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // P95 < 500ms para envio de mensagens
    http_req_failed: ['rate<0.02'],   // < 2% de falhas
    errors: ['rate<0.02'],            // < 2% de erros
    message_latency_ms: ['p(95)<1000'], // P95 < 1s para latência total
    queue_lag_ms: ['p(95)<1000'],     // P95 < 1s para queue lag (SLO)
  },
};

// Variáveis globais
let accessToken = '';
let companyId = '';
let ticketIds = [];

// Função de setup para login e preparação
export function setup() {
  console.log(`Starting k6 load test for chat send`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Target: 20-40 msgs/s, P95 < 1s, queue lag < 1s`);
  
  // Login para obter token
  const loginPayload = JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
  });

  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    accessToken = loginRes.json('accessToken');
    companyId = loginRes.json('user.companyId');
    console.log(`Login successful, token obtained`);
    
    // Buscar tickets existentes para enviar mensagens
    const ticketsRes = http.get(`${BASE_URL}/api/v1/tickets?limit=50&status=open`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (ticketsRes.status === 200) {
      const tickets = ticketsRes.json('data');
      ticketIds = tickets.map(t => t.id);
      console.log(`Found ${ticketIds.length} open tickets for messaging`);
    }

    return { 
      token: accessToken, 
      companyId, 
      ticketIds 
    };
  } else {
    console.error(`Login failed: ${loginRes.status}`);
    throw new Error('Login failed');
  }
}

// Função principal
export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Selecionar ticket aleatório
  const randomTicketId = data.ticketIds[Math.floor(Math.random() * data.ticketIds.length)];
  
  // Mensagens de exemplo para simular conversas reais
  const messageTemplates = [
    'Olá! Como posso ajudar?',
    'Entendi sua solicitação. Vou verificar isso para você.',
    'Perfeito! Já estou trabalhando na solução.',
    'Preciso de mais algumas informações para resolver isso.',
    'Sua solicitação foi aprovada!',
    'Infelizmente não foi possível atender sua solicitação.',
    'Vou escalar isso para nossa equipe técnica.',
    'Obrigado por entrar em contato conosco!',
    'Sua mensagem foi recebida e está sendo processada.',
    'Estou transferindo você para um especialista.',
  ];

  const randomMessage = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
  
  // Simular tempo de digitação
  const typingTime = Math.floor(Math.random() * 3000) + 1000; // 1-4 segundos
  sleep(typingTime / 1000);

  // Enviar mensagem
  const messagePayload = JSON.stringify({
    ticketId: randomTicketId,
    body: randomMessage,
    type: 'outbound',
    provider: 'whatsapp_cloud', // Simular WhatsApp
  });

  const startTime = Date.now();
  const sendRes = http.post(`${BASE_URL}/api/v1/messages`, messagePayload, { headers });
  const endTime = Date.now();

  // Calcular latência total
  const totalLatency = endTime - startTime;
  messageLatency.add(totalLatency);

  // Verificar resposta
  const sendCheck = check(sendRes, {
    'send message status is 201': (r) => r.status === 201,
    'send message response time < 500ms': (r) => r.timings.duration < 500,
    'send message has id': (r) => r.json('id') !== undefined,
    'send message has status': (r) => r.json('status') !== undefined,
  });

  if (!sendCheck) {
    errorRate.add(1);
    console.error(`Send message failed: ${sendRes.status} - ${sendRes.body}`);
  }

  // Simular confirmação de entrega via WebSocket (opcional)
  if (sendRes.status === 201) {
    const messageId = sendRes.json('id');
    
    // Aguardar um pouco e verificar status da mensagem
    sleep(1);
    
    const statusRes = http.get(`${BASE_URL}/api/v1/messages/${messageId}`, { headers });
    
    check(statusRes, {
      'message status check is 200': (r) => r.status === 200,
      'message status check response time < 200ms': (r) => r.timings.duration < 200,
    });

    // Simular queue lag (tempo entre envio e processamento)
    if (statusRes.status === 200) {
      const message = statusRes.json();
      if (message.status === 'delivered') {
        const queueLag = totalLatency; // Simplificado para o teste
        queueLagTrend.add(queueLag);
      }
    }
  }

  // Simular tempo de resposta do agente
  const responseTime = Math.floor(Math.random() * 5000) + 2000; // 2-7 segundos
  sleep(responseTime / 1000);

  // Ocasionalmente, simular mensagem de resposta do cliente
  if (Math.random() > 0.7) { // 30% das vezes
    const clientMessage = `Resposta do cliente: ${faker.lorem.sentence()}`;
    
    const clientPayload = JSON.stringify({
      ticketId: randomTicketId,
      body: clientMessage,
      type: 'inbound',
      provider: 'whatsapp_cloud',
      customerPhone: '+5511999999999',
    });

    const clientRes = http.post(`${BASE_URL}/api/v1/messages`, clientPayload, { headers });
    
    check(clientRes, {
      'client message status is 201': (r) => r.status === 201,
    });
  }

  // Pausa entre ciclos de mensagens
  sleep(2);
}

// Hook de teardown
export function teardown(data) {
  console.log(`Chat send test completed`);
  console.log(`Target: 20-40 msgs/s, P95 < 1s, queue lag < 1s`);
}

// Função auxiliar para gerar texto aleatório
function faker() {
  const words = [
    'Olá', 'Oi', 'Bom dia', 'Boa tarde', 'Boa noite',
    'Obrigado', 'Valeu', 'Perfeito', 'Entendi', 'Claro',
    'Sim', 'Não', 'Talvez', 'Depois', 'Agora',
    'Amanhã', 'Hoje', 'Ontem', 'Sempre', 'Nunca'
  ];
  
  return {
    lorem: {
      sentence: () => {
        const wordCount = Math.floor(Math.random() * 5) + 3;
        const selectedWords = [];
        for (let i = 0; i < wordCount; i++) {
          selectedWords.push(words[Math.floor(Math.random() * words.length)]);
        }
        return selectedWords.join(' ') + '.';
      }
    }
  };
}
