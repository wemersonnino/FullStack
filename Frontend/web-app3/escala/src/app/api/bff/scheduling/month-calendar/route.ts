import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/scheduling/month-calendar', {
    searchParams: new URL(request.url).searchParams,
    request,
  });
}
