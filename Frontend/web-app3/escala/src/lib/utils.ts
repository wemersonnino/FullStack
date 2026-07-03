import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ENV } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normaliza URLs internas do Strapi (ex: http://cms-strapi:1337)
 * para URLs acessíveis no navegador (ex: http://localhost:1337).
 *
 * Ideal para corrigir URLs retornadas em campos de texto ou rich text.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  const publicHost = ENV.STRAPI_PUBLIC_URL;

  return url
    .replaceAll('http://cms-strapi:1337', publicHost)
    .replaceAll('http://strapi:1337', publicHost)
    .replaceAll('http://localhost:3000', publicHost);
}

/**
 * Normaliza URLs de imagens vindas do Strapi.
 */
export function normalizeStrapiUrl(url?: string | null): string {
  if (!url) return '';

  const publicHost = ENV.STRAPI_PUBLIC_URL;

  // Se a URL já for completa e externa, mantém
  if (url.startsWith('http') && !url.includes('strapi') && !url.includes('cms-strapi') && !url.includes('localhost:1337')) {
    return url;
  }

  // URLs de midia do Strapi devem sair públicas para o navegador.
  if (url.startsWith('/uploads')) {
    return `${publicHost}${url}`;
  }

  // Corrige hosts internos do Docker/Kubernetes para o host público exposto no Compose.
  if (url.includes('cms-strapi') || url.includes('strapi:1337') || url.includes('localhost:1337')) {
    return url.replace(/http:\/\/((cms-)?strapi|localhost):1337/g, publicHost);
  }

  return url;
}

/**
 * Normaliza URLs de Avatares (Google ou endpoint protegido do App).
 * Avatares locais agora são servidos por rota autenticada do BFF.
 */
export function normalizeAvatarUrl(url?: string | null): string {
  if (!url) return '';

  // 1. Google ou URLs externas completas
  if (url.startsWith('http')) {
    return url;
  }

  // 2. Uploads locais protegidos do App.
  if (url.startsWith('/api/bff/avatar/files/')) {
    return url;
  }

  // 3. Legado: uploads antigos em public/ do App.
  if (url.startsWith('/uploads/avatars')) {
    return url;
  }

  // 4. Fallback para Strapi caso algum avatar antigo tenha vindo de lá
  if (url.startsWith('/uploads')) {
    return `${ENV.STRAPI_PUBLIC_URL}${url}`;
  }

  return url;
}

type AvatarLike = {
  avatarUrl?: string | null;
  image?: string | null;
  picture?: string | null;
  avatar?: string | { url?: string | null } | null;
};

export function resolveAvatarUrl(user?: AvatarLike | null): string {
  if (!user) return '';

  const avatarValue = typeof user.avatar === 'string' ? user.avatar : user.avatar?.url;
  return normalizeAvatarUrl(user.avatarUrl || avatarValue || user.image || user.picture || null);
}
