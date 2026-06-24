import { proxyBackend } from '@/lib/bff/backend';

export async function POST(request: Request) {
  return proxyBackend('/api/v1/rebac/management-closure/recalculate', {
    method: 'POST',
    request,
  });
}
