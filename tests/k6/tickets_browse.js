import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações
const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8080';
const EMAIL = __ENV.K6_ACCESS_EMAIL || 'admin@test.com';
const PASSWORD = __ENV.K6_ACCESS_PASSWORD || '123456';

// Métricas customizadas
const errorRate = new Rate('errors');
const slowResponseRate = new Rate('slow_responses');

// Configuração do teste
export const options = {
  stages: [
    { duration: '1m', target: 5 },   // Ramp-up para 5 VUs
    { duration: '5m', target: 5 },   // Estável em 5 VUs
    { duration: '1m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<350'], // P95 < 350ms (SLO)
    http_req_failed: ['rate<0.01'],   // < 1% de falhas
    errors: ['rate<0.01'],            // < 1% de erros
    slow_responses: ['rate<0.05'],    // < 5% de respostas lentas
  },
};

// Variáveis globais para armazenar token
let accessToken = '';

// Função de setup para login
export function setup() {
  console.log(`Starting k6 load test for tickets browse`);
  console.log(`Base URL: ${BASE_URL}`);
  
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
    console.log(`Login successful, token obtained`);
    return { token: accessToken };
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

  // 1. Listar tickets (página inicial)
  const listRes = http.get(`${BASE_URL}/api/v1/tickets?limit=20&page=1`, { headers });

  check(listRes, {
    'list tickets status is 200': (r) => r.status === 200,
    'list tickets response time < 300ms': (r) => r.timings.duration < 300,
    'list tickets has data': (r) => r.json('data') !== undefined,
    'list tickets has pagination': (r) => r.json('pagination') !== undefined,
  });

  if (listRes.timings.duration > 300) {
    slowResponseRate.add(1);
  }

  // 2. Buscar tickets por status
  const statuses = ['open', 'pending', 'resolved', 'closed'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const statusRes = http.get(`${BASE_URL}/api/v1/tickets?status=${randomStatus}&limit=10`, { headers });

  check(statusRes, {
    'filter by status status is 200': (r) => r.status === 200,
    'filter by status response time < 250ms': (r) => r.timings.duration < 250,
  });

  // 3. Buscar tickets por prioridade
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
  
  const priorityRes = http.get(`${BASE_URL}/api/v1/tickets?priority=${randomPriority}&limit=10`, { headers });

  check(priorityRes, {
    'filter by priority status is 200': (r) => r.status === 200,
    'filter by priority response time < 250ms': (r) => r.timings.duration < 250,
  });

  // 4. Buscar tickets por canal
  const channels = ['whatsapp', 'telegram', 'web'];
  const randomChannel = channels[Math.floor(Math.random() * channels.length)];
  
  const channelRes = http.get(`${BASE_URL}/api/v1/tickets?channel=${randomChannel}&limit=10`, { headers });

  check(channelRes, {
    'filter by channel status is 200': (r) => r.status === 200,
    'filter by channel response time < 250ms': (r) => r.timings.duration < 250,
  });

  // 5. Paginação com cursor (keyset)
  if (listRes.status === 200 && listRes.json('data') && listRes.json('data').length > 0) {
    const firstTicket = listRes.json('data')[0];
    const cursor = firstTicket.createdAt;
    
    const cursorRes = http.get(`${BASE_URL}/api/v1/tickets?cursor=${cursor}&limit=20`, { headers });

    check(cursorRes, {
      'cursor pagination status is 200': (r) => r.status === 200,
      'cursor pagination response time < 300ms': (r) => r.timings.duration < 300,
      'cursor pagination has different data': (r) => {
        const newData = r.json('data');
        return newData && newData.length > 0 && newData[0].id !== firstTicket.id;
      },
    });
  }

  // 6. Busca por texto
  const searchTerms = ['suporte', 'bug', 'feature', 'urgente'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  const searchRes = http.get(`${BASE_URL}/api/v1/tickets?q=${randomTerm}&limit=10`, { headers });

  check(searchRes, {
    'search tickets status is 200': (r) => r.status === 200,
    'search tickets response time < 400ms': (r) => r.timings.duration < 400,
  });

  // Verificar erros
  const allChecks = [
    listRes, statusRes, priorityRes, channelRes, searchRes
  ];

  allChecks.forEach((res, index) => {
    if (res.status >= 400) {
      errorRate.add(1);
      console.error(`Request ${index} failed: ${res.status} - ${res.body}`);
    }
  });

  // Pausa entre requisições
  sleep(3);
}

// Hook de teardown
export function teardown(data) {
  console.log(`Tickets browse test completed`);
  console.log(`Target: P95 < 350ms, < 1% errors, < 5% slow responses`);
}
