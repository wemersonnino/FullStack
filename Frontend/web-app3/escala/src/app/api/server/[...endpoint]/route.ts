import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ENV } from '@/constants/env';

type RouteContext = {
  params: Promise<{
    endpoint?: string[];
  }>;
};

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const DENIED_BACKEND_PREFIXES = [
  'api/v1/auth',
  'api/v1/public',
  'api/v1/billing/webhook',
  'api/v1/webhooks',
  'actuator',
  'swagger-ui',
  'v3/api-docs',
  'webjars',
] as const;
const ALLOWED_BACKEND_PREFIXES = [
  'api/v1/users',
  'api/v1/learning-progress',
  'api/v1/companies',
  'api/v1/employees',
  'api/v1/organization',
  'api/v1/work-posts',
  'api/v1/escala',
  'api/v1/schedules',
  'api/v1/check-in',
  'api/v1/reports',
  'api/v1/stats',
  'api/v1/team/invitations',
  'api/v1/leads',
  'api/v1/messages',
  'api/v1/operational-capacities',
  'api/v1/audit-logs',
  'api/v1/rebac',
  'api/v1/billing',
  'api/v1/ai',
] as const;
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

function normalizeEndpointPath(endpoint: string[]) {
  return endpoint
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment).trim())
    .filter(Boolean)
    .join('/');
}

function isAllowedBackendPath(path: string) {
  if (!path) return false;
  if (path.includes('..')) return false;
  if (DENIED_BACKEND_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return false;
  }
  return ALLOWED_BACKEND_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function buildBackendUrl(endpoint: string[], request: NextRequest) {
  const cleanPath = endpoint
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');

  const url = new URL(`/${cleanPath}`, ENV.API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url;
}

function copyRequestHeaders(request: NextRequest, accessToken: string) {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');

  if (contentType) headers.set('Content-Type', contentType);
  headers.set('Accept', accept || 'application/json');
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('X-Requested-With', 'escala-next-bff');

  return headers;
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers();
  const contentType = response.headers.get('content-type');

  if (contentType) headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');

  response.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(normalizedKey) && normalizedKey.startsWith('x-')) {
      headers.set(key, value);
    }
  });

  return headers;
}

async function proxyToBackend(request: NextRequest, context: RouteContext) {
  if (!ALLOWED_METHODS.includes(request.method as (typeof ALLOWED_METHODS)[number])) {
    return jsonError('Metodo nao permitido', 405);
  }

  const jwt = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = typeof jwt?.accessToken === 'string' ? jwt.accessToken : undefined;

  if (!accessToken) {
    return jsonError('Nao autorizado', 401);
  }

  const { endpoint = [] } = await context.params;
  if (endpoint.length === 0) {
    return jsonError('Endpoint nao informado', 400);
  }
  const normalizedPath = normalizeEndpointPath(endpoint);
  if (!isAllowedBackendPath(normalizedPath)) {
    return jsonError('Endpoint nao permitido pelo BFF', 403);
  }

  const backendUrl = buildBackendUrl(endpoint, request);
  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: copyRequestHeaders(request, accessToken),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
    });

    const responseBody = await backendResponse.arrayBuffer();
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: copyResponseHeaders(backendResponse),
    });
  } catch (error) {
    console.error('[BFF] Falha ao encaminhar requisicao para o backend', {
      endpoint: endpoint.join('/'),
      method: request.method,
      error: error instanceof Error ? error.message : 'unknown',
    });

    return jsonError('Nao foi possivel processar a requisicao', 502);
  }
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
