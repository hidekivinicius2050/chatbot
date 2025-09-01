import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações
const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8080';
const EMAIL = __ENV.K6_ACCESS_EMAIL || 'admin@test.com';
const PASSWORD = __ENV.K6_ACCESS_PASSWORD || '123456';

// Métricas customizadas
const errorRate = new Rate('errors');

// Configuração do teste
export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp-up para 10 VUs
    { duration: '3m', target: 10 },  // Estável em 10 VUs
    { duration: '1m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<350'], // P95 < 350ms (SLO)
    http_req_failed: ['rate<0.01'],   // < 1% de falhas
    errors: ['rate<0.01'],            // < 1% de erros
  },
};

// Função principal
export default function () {
  const loginPayload = JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Login
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, params);

  // Verificar resposta
  const loginCheck = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 200ms': (r) => r.timings.duration < 200,
    'login has access token': (r) => r.json('accessToken') !== undefined,
    'login has refresh token': (r) => r.json('refreshToken') !== undefined,
  });

  if (!loginCheck) {
    errorRate.add(1);
    console.error(`Login failed: ${loginRes.status} - ${loginRes.body}`);
  }

  // Simular tempo de sessão
  sleep(1);

  // Refresh token (opcional)
  if (loginRes.status === 200) {
    const refreshToken = loginRes.json('refreshToken');
    const refreshPayload = JSON.stringify({
      refreshToken,
    });

    const refreshRes = http.post(`${BASE_URL}/api/v1/auth/refresh`, refreshPayload, params);

    check(refreshRes, {
      'refresh status is 200': (r) => r.status === 200,
      'refresh response time < 150ms': (r) => r.timings.duration < 150,
      'refresh has new access token': (r) => r.json('accessToken') !== undefined,
    });
  }

  // Pausa entre requisições
  sleep(2);
}

// Hook de setup (executado uma vez)
export function setup() {
  console.log(`Starting k6 load test for auth login`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Email: ${EMAIL}`);
  console.log(`Target: P95 < 350ms, < 1% errors`);
}

// Hook de teardown (executado uma vez)
export function teardown(data) {
  console.log(`Test completed`);
}
