import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const PRIVATE_ROUTES = ['/dashboard', '/users'];

function stripLocale(pathname: string) {
  return pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, '/');
}

function getLocalePrefix(pathname: string) {
  const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/);
  if (!localeMatch || localeMatch[1] === routing.defaultLocale) return '';
  return `/${localeMatch[1]}`;
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

    if (token) {
      response = intlMiddleware(req);
    } else {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = `${getLocalePrefix(req.nextUrl.pathname)}/login`;
      loginUrl.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`);
      response = NextResponse.redirect(loginUrl);
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

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)',
  ],
};
