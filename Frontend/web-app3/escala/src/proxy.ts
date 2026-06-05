import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

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

  if (!isPrivateRoute) {
    return intlMiddleware(req);
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  if (token) {
    return intlMiddleware(req);
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = `${getLocalePrefix(req.nextUrl.pathname)}/login`;
  loginUrl.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export default proxy;

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)',
  ],
};
