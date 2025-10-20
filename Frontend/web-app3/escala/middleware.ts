import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import {routing} from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default withAuth(
    function middleware(req) {
        // Integra a internacionalização ao fluxo de autenticação
        return intlMiddleware(req);
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const PUBLIC_ROUTES = [
                    '/',
                    '/auth/login',
                    '/auth/register',
                    '/auth/forgot-password',
                    '/api/auth',
                ];

                // Libera rotas públicas sem token
                if (PUBLIC_ROUTES.some((path) => req.nextUrl.pathname.startsWith(path))) {
                    return true;
                }

                // Exige token para rotas privadas
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        // Padrão da doc do next-intl
        '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
        // Para permitir paths com pontos (ex.: /users/jane.doe)
        '/([\\w-]+)?/users/(.+)',
    ],
};
