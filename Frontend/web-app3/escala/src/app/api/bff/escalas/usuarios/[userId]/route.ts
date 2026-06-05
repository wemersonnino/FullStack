import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return proxyBackend(`/api/v1/escala/usuarios/${userId}`, { request });
}
