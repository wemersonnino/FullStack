import { proxyBackend, readJson } from '@/lib/bff/backend';
import { requireEscalaAdmin } from '../_permissions';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;
  const { id } = await params;

  return proxyBackend(`/api/v1/escala/${id}`, {
    method: 'PUT',
    body: await readJson(request),
    request,
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;
  const { id } = await params;

  return proxyBackend(`/api/v1/escala/${id}`, {
    method: 'DELETE',
    request,
  });
}
