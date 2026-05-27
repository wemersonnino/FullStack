import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return proxyBackend('/api/companies', { request, searchParams });
}

export async function POST(request: Request) {
  return proxyBackend('/api/companies', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
