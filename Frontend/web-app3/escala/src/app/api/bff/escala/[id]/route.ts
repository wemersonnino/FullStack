import { proxyBackend, readJson } from '@/lib/bff/backend';
import { requireEscalaAdmin } from '../_permissions';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;

  const { id } = await context.params;
  return proxyBackend(`/api/v1/escala/${id}`, {
    method: 'PUT',
    body: await readJson(request),
    request,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;

  const { id } = await context.params;
  return proxyBackend(`/api/v1/escala/${id}`, {
    method: 'DELETE',
    request,
  });
}
