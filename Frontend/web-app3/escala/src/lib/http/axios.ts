import axios from 'axios';

/**
 * Instância global do Axios.
 * Rotas de CMS usam URLs absolutas do Strapi; rotas de domínio usam o BFF em /api/bff.
 */
export const api = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Interceptor global para observabilidade de falhas HTTP.
 * Nao derruba a sessao automaticamente: um 401 pode representar
 * permissao insuficiente em um recurso especifico, nao sessao invalida.
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const method = String(error.config?.method || 'GET').toUpperCase();
      const url = error.config?.url || 'unknown-url';
      console.warn(`[HTTP 401] ${method} ${url}`);
    }

    return Promise.reject(error);
  }
);

export default api;
