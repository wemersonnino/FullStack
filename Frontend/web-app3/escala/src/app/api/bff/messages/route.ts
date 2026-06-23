import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/messages', {
    request,
    searchParams: new URL(request.url).searchParams,
  });
}

export async function POST(request: Request) {
  return proxyBackend('/api/v1/messages', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
