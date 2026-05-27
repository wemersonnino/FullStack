import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default withAuth(
  function proxy(req) {
    return intlMiddleware(req);
  },
  {
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

        if (PUBLIC_ROUTES.some((path) => req.nextUrl.pathname.startsWith(path))) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)',
  ],
};
