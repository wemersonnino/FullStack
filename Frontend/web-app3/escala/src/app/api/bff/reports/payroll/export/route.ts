import { NextResponse } from 'next/server';
import { ENV } from '@/constants/env';
import { getOptionalServerAccessToken } from '@/lib/auth/server-auth';

export async function GET(request: Request) {
  const accessToken = await getOptionalServerAccessToken();
  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const backendUrl = new URL('/api/v1/reports/payroll/export', ENV.API_BASE_URL);
  searchParams.forEach((value, key) => backendUrl.searchParams.set(key, value));

  const response = await fetch(backendUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'text/csv',
    },
    cache: 'no-store',
  });

  const body = await response.arrayBuffer();
  const headers = new Headers();
  headers.set('Content-Type', response.headers.get('content-type') || 'text/csv');
  headers.set('Cache-Control', 'no-store');

  const disposition = response.headers.get('content-disposition');
  if (disposition) {
    headers.set('Content-Disposition', disposition);
  }

  return new NextResponse(body, {
    status: response.status,
    headers,
  });
}
