import { proxyBackend, readJson } from '@/lib/bff/backend';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyBackend(`/api/v1/scheduling/cycles/${id}/assignments`, {
    request,
  });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyBackend(`/api/v1/scheduling/cycles/${id}/assignments`, {
    method: 'PATCH',
    body: await readJson(request),
    request,
  });
}
