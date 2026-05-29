import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function POST(request: Request) {
  return proxyBackend('/api/v1/auth/google', {
    method: 'POST',
    body: await readJson(request),
    authenticated: false,
  });
}
