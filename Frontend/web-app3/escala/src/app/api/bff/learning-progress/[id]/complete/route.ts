import { proxyBackend } from '@/lib/bff/backend';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyBackend(`/api/v1/learning-progress/${id}/complete`, {
    method: 'PATCH',
    request,
  });
}
