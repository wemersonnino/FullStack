import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function PATCH(request: Request) {
  return proxyBackend('/api/v1/users/me/password', {
    method: 'PATCH',
    body: await readJson(request),
    request,
  });
}
