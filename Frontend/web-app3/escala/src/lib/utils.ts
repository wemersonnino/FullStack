import { ENV } from '@/constants';

/**
 * Normaliza URLs internas do Strapi (ex: http://cms-strapi:1337)
 * para URLs acessíveis no navegador (ex: http://localhost:1337).
 *
 * Ideal para corrigir URLs retornadas em campos de texto ou rich text.
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  const publicHost = ENV.STRAPI_PUBLIC_URL;

  return url
    .replaceAll('http://cms-strapi:1337', publicHost)
    .replaceAll('http://strapi:1337', publicHost)
    .replaceAll('http://localhost:3000', publicHost);
}

/**
 * Normaliza URLs de imagens retornadas pelo Strapi (com ou sem host).
 *
 * Casos cobertos:
 *  - "/uploads/file.jpg" → "http://localhost:1337/uploads/file.jpg"
 *  - "http://cms-strapi:1337/uploads/file.jpg" → "http://localhost:1337/uploads/file.jpg"
 *  - Já públicas → mantém como estão
 */
export function normalizeImageUrlStrapi(url?: string): string {
  if (!url) return '';

  const publicHost = ENV.STRAPI_PUBLIC_URL;

  if (url.startsWith('/uploads')) return `${publicHost}${url}`;
  if (url.includes('cms-strapi') || url.includes('strapi:1337'))
    return url.replaceAll(/http:\/\/(cms-)?strapi:1337/, publicHost);

  return url;
}
