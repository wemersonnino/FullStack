import { proxyBackend } from '@/lib/bff/backend';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  return proxyBackend(`/api/v1/escala/usuarios/${params.userId}`, { request });
}
