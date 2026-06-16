export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  IS_SERVER: globalThis.window === undefined,

  // URL interna usada no SSR. No Docker, defina NEXT_INTERNAL_STRAPI_URL.
  STRAPI_INTERNAL_URL:
    process.env.NEXT_INTERNAL_STRAPI_URL ||
    process.env.STRAPI_API_URL ||
    process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL ||
    'http://localhost:1337',

  // 🌐 URL pública usada no client (navegador)
  STRAPI_PUBLIC_URL: process.env.NEXT_PUBLIC_STRAPI_PUBLIC_URL || 'http://localhost:1337',

  // Backend Spring Boot oficial da aplicacao. Server-side only.
  API_BASE_URL:
    process.env.API_BASE_URL ||
    'http://localhost:8080',
  APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000',
  COMPANY_SLUG: process.env.NEXT_PUBLIC_COMPANY_SLUG || 'escala-demo',
  RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  RECAPTCHA_ENABLED:
    process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED !== 'false'),
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
};
