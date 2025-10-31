import axios from 'axios';
import { ENV } from '@/constants';
import { signOut } from 'next-auth/react';

/**
 * Instância global do Axios configurada para comunicação com a API do Strapi.
 * Determina automaticamente se deve usar a URL interna (SSR) ou pública (Client).
 * Instância global do Axios com base dinâmica.
 * SSR → STRAPI_INTERNAL_URL (cms-strapi)
 * Client → STRAPI_PUBLIC_URL (localhost)
 */
export const api = axios.create({
  baseURL: ENV.IS_SERVER ? ENV.STRAPI_INTERNAL_URL : ENV.STRAPI_PUBLIC_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Interceptor global para capturar erros de autenticação (401)
 * e redirecionar o usuário para o login.
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      signOut({ callbackUrl: '/(PUBLIC)/auth/login' });
    }

    const wrappedError = new Error(error.message, { cause: error });
    return Promise.reject(wrappedError);
  }
);

export default api;
