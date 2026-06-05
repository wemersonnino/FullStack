export { default, proxy } from './src/proxy';

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)',
  ],
};
