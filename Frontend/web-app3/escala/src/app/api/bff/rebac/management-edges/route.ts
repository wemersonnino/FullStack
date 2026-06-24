import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/rebac/management-edges', { request });
}

export async function POST(request: Request) {
  return proxyBackend('/api/v1/rebac/management-edges', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
