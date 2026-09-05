import { NextResponse } from 'next/server';
import { ENV } from '@/constants/env';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function appOrigin() {
  try {
    return new URL(ENV.APP_URL).origin;
  } catch {
    return null;
  }
}

/** The BFF uses an HttpOnly NextAuth cookie, so mutations must be same-origin. */
export function rejectCrossSiteBffRequest(request: Request): NextResponse | null {
  if (!UNSAFE_METHODS.has(request.method.toUpperCase())) return null;

  const expectedOrigin = appOrigin();
  const origin = request.headers.get('origin');
  if (!expectedOrigin || !origin || origin !== expectedOrigin) {
    return NextResponse.json(
      { message: 'Origem da requisicao nao permitida' },
      { status: 403, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' } }
    );
  }

  return null;
}
