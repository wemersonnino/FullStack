export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  IS_SERVER: globalThis.window === undefined,

  // 🔧 URL interna usada apenas no SSR (Server Components)
  STRAPI_INTERNAL_URL: process.env.NEXT_INTERNAL_STRAPI_URL || 'http://cms-strapi:1337',

  // 🌐 URL pública usada no client (navegador)
  STRAPI_PUBLIC_URL: process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL || 'http://localhost:1337',
};
