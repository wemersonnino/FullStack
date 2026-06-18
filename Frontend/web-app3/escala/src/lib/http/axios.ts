import axios from 'axios';
import { signOut } from 'next-auth/react';

/**
 * Instância global do Axios.
 * Rotas de CMS usam URLs absolutas do Strapi; rotas de domínio usam o BFF em /api/bff.
 */
export const api = axios.create({
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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      signOut({ callbackUrl: '/login' });
    }

    const wrappedError = new Error(error.message, { cause: error });
    return Promise.reject(wrappedError);
  }
);

export default api;
