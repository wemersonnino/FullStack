import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
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
  const url = new URL(path, ENV.API_BASE_URL);
  if (options.searchParams) {
    options.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  const isFormData = options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.authenticated !== false) {
    let accessToken: string | undefined;

    // 1. Tenta extrair o token do cookie (NextAuth) se houver requisição
    if (options.request) {
      const jwtToken = await getToken({ req: options.request as any, secret: process.env.NEXTAUTH_SECRET });
      accessToken = typeof jwtToken?.accessToken === 'string' ? jwtToken.accessToken : undefined;
    }

    // 2. Fallback: tenta obter da sessão (necessário para Server Components e chamadas server-side)
    if (!accessToken) {
      const session = await getServerSession(authOptions);
      accessToken = session?.user?.token;
    }

    if (!accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  return NextResponse.json(data, { status: response.status });
}

export async function readJson(request: Request) {
  const text = await request.text();
  return text ? JSON.parse(text) : undefined;
}
