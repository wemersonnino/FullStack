import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return proxyBackend('/api/v1/escala/me', { request, searchParams });
}
