import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // sube a 5 usuarios en 10s
    { duration: '20s', target: 5 },   // mantiene 5 usuarios 20s
    { duration: '5s', target: 0 },    // baja a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% de peticiones < 500ms
    http_req_failed: ['rate<0.01'],    // menos del 1% de errores
  },
};

export default function () {
  const res = http.get('http://host.docker.internal:8080/api/health');
  check(res, {
    'status es 200': (r) => r.status === 200,
  });
  sleep(1);
}