import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request) {
  return proxyBackend('/api/v1/rebac/enums/manager-role-levels', { request });
}
