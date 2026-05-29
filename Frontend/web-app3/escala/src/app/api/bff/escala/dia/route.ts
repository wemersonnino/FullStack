import { proxyBackend } from '@/lib/bff/backend';
import { requireEscalaSession } from '../_permissions';

export async function GET(request: Request) {
  const state = await requireEscalaSession();
  if ('response' in state) return state.response;

  return proxyBackend('/api/v1/escala/dia', {
    searchParams: new URL(request.url).searchParams,
    request,
  });
}
