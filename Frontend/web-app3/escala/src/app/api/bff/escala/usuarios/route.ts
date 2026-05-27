import { proxyBackend } from '@/lib/bff/backend';
import { requireEscalaAdmin } from '../_permissions';

export async function GET(request: Request) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;

  return proxyBackend('/api/v1/escala/usuarios', {
    searchParams: new URL(request.url).searchParams,
    request,
  });
}
