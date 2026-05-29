import { proxyBackend, readJson } from '@/lib/bff/backend';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackend(`/api/v1/schedules/swap-requests/${id}/decision`, {
    method: 'PATCH',
    body: await readJson(request),
    request,
  });
}
