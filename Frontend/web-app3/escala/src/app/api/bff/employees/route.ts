import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/employees', { request });
}

export async function POST(request: Request) {
  return proxyBackend('/api/v1/employees', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
