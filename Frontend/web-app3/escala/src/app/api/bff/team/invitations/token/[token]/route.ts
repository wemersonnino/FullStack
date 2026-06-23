import { proxyBackend } from '@/lib/bff/backend';

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;

  return proxyBackend(`/api/v1/team/invitations/token/${token}`, {
    authenticated: false,
    request,
  });
}
