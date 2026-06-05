import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(req: any) {
  return intlMiddleware(req);
}

export default withAuth(proxy, {
  callbacks: {
    authorized: ({ req, token }) => {
      const PUBLIC_ROUTES = [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/api/auth',
        '/acesso-negado',
      ];

      const pathname = req.nextUrl.pathname;
      const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, '/');

      if (
        PUBLIC_ROUTES.some(
          (path) =>
            pathnameWithoutLocale === path ||
            pathnameWithoutLocale.startsWith(path + '/') ||
            pathname.startsWith(path),
        )
      ) {
        return true;
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/([\\w-]+)?/users/(.+)'],
};
