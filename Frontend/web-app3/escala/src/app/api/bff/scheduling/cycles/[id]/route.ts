import { proxyBackend } from '@/lib/bff/backend';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyBackend(`/api/v1/scheduling/cycles/${id}`, {
    request,
  });
}
