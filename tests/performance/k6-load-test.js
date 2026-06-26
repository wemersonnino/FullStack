import http from 'k6/http';
import { check, sleep } from 'k6';

// Configurações do teste de carga e stress
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up: sobe para 20 usuários simultâneos
    { duration: '1m', target: 20 },   // Carga constante: mantém 20 usuários simultâneos (cenário nominal)
    { duration: '30s', target: 100 }, // Stress: sobe para 100 usuários simultâneos (descobrir gargalos)
    { duration: '1m', target: 100 },  // Limite: mantém 100 usuários simultâneos
    { duration: '30s', target: 0 },   // Ramp-down: reduz o tráfego a zero
  ],
  thresholds: {
    // 95% das requisições devem responder em menos de 500ms
    http_req_duration: ['p(95)<500'],
    // A taxa de erro de requisições deve ser inferior a 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // 1. Simula requisição da sessão NextAuth do cliente
  const sessionRes = http.get(`${BASE_URL}/api/auth/session`);
  check(sessionRes, {
    'session respondida com 200': (r) => r.status === 200,
    'session nao contem token de acesso (seguro)': (r) => {
      const body = JSON.parse(r.body);
      return !body?.user?.token;
    },
  });

  sleep(1);

  // 2. Simula consulta de escalas de trabalho no BFF
  const escalaRes = http.get(`${BASE_URL}/api/bff/escala`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  check(escalaRes, {
    'escala respondeu (200 ou 401)': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // 3. Simula consulta de funcionários no BFF
  const employeeRes = http.get(`${BASE_URL}/api/bff/employees`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  check(employeeRes, {
    'employees respondeu (200 ou 401)': (r) => r.status === 200 || r.status === 401,
  });

  sleep(2);
}
