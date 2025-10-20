// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const rotasPrivadas = [
  '/dashboard',
  '/relatorios',
  '/area-aluno',
  '/instituicao/(PRIVATE)',
  '/instituicao/ofertas/[codigoCae]/matricula'
]

const intlMiddleware = createIntlMiddleware(routing)

export default withAuth(
  async function middleware(req) {
    // aplica next-intl
    const intlResponse = intlMiddleware(req)
    if (intlResponse) return intlResponse

    const pathname = req.nextUrl.pathname
    const [, maybeLocale] = pathname.split('/')
    const locale = routing.locales.includes(maybeLocale as any)
      ? maybeLocale
      : routing.defaultLocale

    const token = req.nextauth.token
    const isPrivate = rotasPrivadas.some((rota) => pathname.includes(rota))

    // 🚫 sem token em rota privada → login
    if (!token && isPrivate) {
      const signInUrl = new URL(
        locale === routing.defaultLocale
          ? '/auth/login'
          : `/${locale}/auth/login`,
        req.url
      )
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    // 🔒 autenticado acessando /auth → redireciona p/ home
    if (token && pathname.includes('/auth')) {
      const home = locale === routing.defaultLocale ? '/home' : `/${locale}/home`
      return NextResponse.redirect(new URL(home, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname
        if (!token) {
          return !rotasPrivadas.some((rota) => pathname.includes(rota))
        }
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
