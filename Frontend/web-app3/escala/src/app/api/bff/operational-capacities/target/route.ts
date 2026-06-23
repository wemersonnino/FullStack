import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/operational-capacities/target', {
    request,
    searchParams: new URL(request.url).searchParams,
  });
}
