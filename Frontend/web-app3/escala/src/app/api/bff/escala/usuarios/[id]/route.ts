import { proxyBackend } from '@/lib/bff/backend';
import { requireEscalaAdmin } from '../../_permissions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;
  const { id } = await params;

  return proxyBackend(`/api/v1/escala/usuarios/${id}`, { request });
}
