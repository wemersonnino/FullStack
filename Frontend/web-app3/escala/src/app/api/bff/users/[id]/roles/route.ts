import { proxyBackend, readJson } from '@/lib/bff/backend';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackend(`/api/v1/users/${id}/roles`, {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackend(`/api/v1/users/${id}/roles`, {
    method: 'DELETE',
    body: await readJson(request),
    request,
  });
}
