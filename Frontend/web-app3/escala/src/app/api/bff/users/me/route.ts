import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/users/me', { request });
}

export async function PATCH(request: Request) {
  return proxyBackend('/api/v1/users/me', {
    method: 'PATCH',
    body: await readJson(request),
    request,
  });
}
