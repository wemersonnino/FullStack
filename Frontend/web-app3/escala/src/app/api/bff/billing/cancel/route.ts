import { proxyBackend } from '@/lib/bff/backend';

export async function POST(request: Request) {
  return proxyBackend('/api/v1/billing/cancel', {
    method: 'POST',
    request,
  });
}
