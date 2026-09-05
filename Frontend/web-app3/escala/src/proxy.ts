import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const PRIVATE_ROUTES = ['/dashboard', '/users'];
const ACCESS_TOKEN_EXPIRY_SKEW_MS = 5_000;
const NEXTAUTH_SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'authjs.session-token',
  '__Secure-authjs.session-token',
];

function stripLocale(pathname: string) {
  return pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, '/');
}

function getLocalePrefix(pathname: string) {
  const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/);
  if (!localeMatch || localeMatch[1] === routing.defaultLocale) return '';
  return `/${localeMatch[1]}`;
}

function hasValidAccessToken(token: Awaited<ReturnType<typeof getToken>>) {
  if (!token || typeof token === 'string') {
    return false;
  }

  const jwt = token as Record<string, unknown>;
  if (typeof jwt.accessToken !== 'string' || jwt.accessToken.trim() === '') return false;

  const expiresAt = typeof jwt.accessTokenExpiresAt === 'number'
    ? jwt.accessTokenExpiresAt
    : typeof jwt.exp === 'number'
      ? jwt.exp * 1000
      : null;

  return expiresAt !== null && expiresAt > Date.now() + ACCESS_TOKEN_EXPIRY_SKEW_MS;
}

function clearExpiredSession(response: NextResponse) {
  for (const cookieName of NEXTAUTH_SESSION_COOKIES) {
    response.cookies.delete(cookieName);
  }
}

export async function proxy(req: NextRequest) {
  const pathnameWithoutLocale = stripLocale(req.nextUrl.pathname);
  const isPrivateRoute = PRIVATE_ROUTES.some(
    (path) => pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`)
  );

  let response: NextResponse;

  if (!isPrivateRoute) {
    response = intlMiddleware(req);
  } else {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    });

    if (hasValidAccessToken(token)) {
      response = intlMiddleware(req);
    } else {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = `${getLocalePrefix(req.nextUrl.pathname)}/login`;
      loginUrl.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`);
      response = NextResponse.redirect(loginUrl);
      if (token) {
        clearExpiredSession(response);
      }
    }
  }

  // Capture UTM parameters and Referrer for Marketing ROI
  const url = req.nextUrl;
  const utm_source = url.searchParams.get('utm_source');
  const utm_medium = url.searchParams.get('utm_medium');
  const utm_campaign = url.searchParams.get('utm_campaign');
  
  if (utm_source || utm_medium || utm_campaign) {
    const attributionData = {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content: url.searchParams.get('utm_content'),
      utm_term: url.searchParams.get('utm_term'),
      referrer: req.headers.get('referer') || '',
      capturedAt: new Date().toISOString(),
    };

    const cookieName = process.env.CAMPAIGN_COOKIE_NAME || 'escala_marketing_attribution';
    const ttlDays = parseInt(process.env.MARKETING_ATTRIBUTION_TTL_DAYS || '30', 10);
    
    response.cookies.set({
      name: cookieName,
      value: JSON.stringify(attributionData),
      path: '/',
      maxAge: ttlDays * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)',
  ],
};
