import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/work-posts', { request });
}

export async function POST(request: Request) {
  return proxyBackend('/api/v1/work-posts', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
