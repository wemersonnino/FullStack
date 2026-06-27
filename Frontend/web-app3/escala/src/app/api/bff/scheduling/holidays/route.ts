import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/scheduling/holidays', {
    searchParams: new URL(request.url).searchParams,
    request,
  });
}

export async function POST(request: Request) {
  return proxyBackend('/api/v1/scheduling/holidays', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
