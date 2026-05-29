import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return proxyBackend('/api/v1/escala', { request, searchParams });
}

export async function POST(request: Request) {
  return proxyBackend('/api/v1/escala', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
