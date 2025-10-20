import { ENV } from "@/constants";

/**
 * Normaliza URLs internas do Strapi (como http://cms-strapi:1337)
 * para o host público acessível via navegador (http://localhost:1337).
 *
 * @param url URL original retornada pela API do Strapi
 * @returns URL corrigida com o host público
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return "";

  // host público padrão
  const publicHost = ENV.STRAPI_PUBLIC_URL;

  // substitui o host interno usado dentro do Docker
  return url
    .replace("http://cms-strapi:1337", "http://localhost:1337")
    .replace("http://localhost:3000", "http://localhost:1337")
    .replace("http://cms-strapi:1337", publicHost)
    .replace("http://strapi:1337", publicHost)
    .replace("https://cms-strapi:1337", publicHost);
}

/**
 * Normaliza qualquer URL de imagem retornada pelo Strapi,
 * garantindo que use o host público (http://localhost:1337 em dev).
 *
 * Casos tratados:
 *  - "http://cms-strapi:1337/uploads/..."  →  "http://localhost:1337/uploads/..."
 *  - "/uploads/..."                        →  "http://localhost:1337/uploads/..."
 *  - "http://localhost:1337/uploads/..."   →  mantém igual
 */
export function normalizeImageUrlStrapi(url?: string): string {
  if (!url) return "";

  const publicHost = ENV.STRAPI_PUBLIC_URL || "http://localhost:1337";

  // Se for relativa (ex: /uploads/file.jpg)
  if (url.startsWith("/uploads")) {
    return `${publicHost}${url}`;
  }

  // Se for interna (ex: http://cms-strapi:1337/uploads/file.jpg)
  if (url.includes("cms-strapi") || url.includes("strapi:1337")) {
    return url.replace(/http:\/\/(cms-)?strapi:1337/, publicHost);
  }

  // Se já for uma URL pública válida
  return url;
}
