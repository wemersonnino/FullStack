import { proxyBackend, readJson } from '@/lib/bff/backend';

type Context = {
  params: Promise<{ id: string; alertId: string }>;
};

export async function POST(request: Request, context: Context) {
  const { id, alertId } = await context.params;
  return proxyBackend(`/api/v1/scheduling/cycles/${id}/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
