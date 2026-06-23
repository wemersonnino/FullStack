import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function POST(request: Request) {
  return proxyBackend('/api/v1/billing/checkout', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
