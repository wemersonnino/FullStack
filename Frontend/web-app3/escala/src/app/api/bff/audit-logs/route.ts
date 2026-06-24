import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyBackend('/api/v1/audit-logs', {
    request,
    searchParams: url.searchParams,
  });
}
