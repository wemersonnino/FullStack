import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/stats/summary', {
    request,
    searchParams: new URL(request.url).searchParams,
  });
}
