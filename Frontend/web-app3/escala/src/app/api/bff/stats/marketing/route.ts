import { NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/bff/backend';
import { getOptionalServerAccessToken, getOptionalServerSession } from '@/lib/auth/server-auth';

const MARKETING_ROLES = new Set(['SYSTEM_ADMIN']);

export async function GET(request: Request) {
  const session = await getOptionalServerSession();
  const roles = session?.user?.roles ?? [];
  const canAccess = roles.some((role) => MARKETING_ROLES.has(role));
  const accessToken = await getOptionalServerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!canAccess) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return proxyBackend('/api/v1/stats/marketing', { request });
}
