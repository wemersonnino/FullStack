import { proxyBackend } from '@/lib/bff/backend';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackend(`/api/v1/rebac/manager-assignments/${id}`, {
    method: 'DELETE',
    request,
  });
}
