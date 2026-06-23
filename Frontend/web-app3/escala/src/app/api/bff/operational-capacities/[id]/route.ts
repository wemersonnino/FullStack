import { proxyBackend, readJson } from '@/lib/bff/backend';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyBackend(`/api/v1/operational-capacities/${id}`, {
    method: 'PUT',
    body: await readJson(request),
    request,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyBackend(`/api/v1/operational-capacities/${id}`, {
    method: 'DELETE',
    request,
  });
}
