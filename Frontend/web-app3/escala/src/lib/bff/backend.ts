import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ENV } from '@/constants/env';

type BackendRequestOptions = {
  method?: string;
  body?: unknown;
  authenticated?: boolean;
  searchParams?: URLSearchParams;
  request?: Request;
};

export async function proxyBackend(path: string, options: BackendRequestOptions = {}) {
  const url = new URL(path, ENV.API_INTERNAL_URL);
  if (options.searchParams) {
    options.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.authenticated !== false) {
    const session = await getServerSession(authOptions);
    const incomingAuthorization = options.request?.headers.get('authorization');
    const authorization = session?.user?.token
      ? `Bearer ${session.user.token}`
      : incomingAuthorization;

    if (!authorization) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    headers.Authorization = authorization;
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  return NextResponse.json(data, { status: response.status });
}

export async function readJson(request: Request) {
  const text = await request.text();
  return text ? JSON.parse(text) : undefined;
}
