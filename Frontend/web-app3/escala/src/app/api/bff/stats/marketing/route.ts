import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { proxyBackend } from '@/lib/bff/backend';

const MARKETING_ROLES = new Set(['SYSTEM_ADMIN']);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const roles = session?.user?.roles ?? [];
  const canAccess = roles.some((role) => MARKETING_ROLES.has(role));

  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!canAccess) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return proxyBackend('/api/v1/stats/marketing', { request });
}
