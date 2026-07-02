import axios from 'axios';
import { useAppStore } from '@/stores/app.store';

/**
 * Instância global do Axios.
 * Rotas de CMS usam URLs absolutas do Strapi; rotas de domínio usam o BFF em /api/bff.
 */
export const api = axios.create({
  timeout: typeof process !== 'undefined' && process.env.HTTP_TIMEOUT
    ? Number(process.env.HTTP_TIMEOUT)
    : 30000,
  headers: { 'Content-Type': 'application/json' },
});

const SILENT_URLS = [
  '/api/bff/messages',
  '/messages',
  '/api/auth/session',
  '/api/auth/providers',
];

function isSilentRequest(url?: string) {
  if (!url) return true;
  return SILENT_URLS.some((silentUrl) => url.includes(silentUrl));
}

let activeRequests = 0;

function startLoading(url?: string) {
  if (typeof window === 'undefined' || isSilentRequest(url)) return;
  activeRequests++;
  if (activeRequests === 1) {
    useAppStore.getState().setLoading(true);
  }
}

function stopLoading(url?: string) {
  if (typeof window === 'undefined' || isSilentRequest(url)) return;
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    useAppStore.getState().setLoading(false);
  }
}

api.interceptors.request.use(
  (config) => {
    startLoading(config.url);
    return config;
  },
  (error) => {
    stopLoading(error.config?.url);
    return Promise.reject(error);
  }
);

/**
 * Interceptor global para observabilidade de falhas HTTP.
 * Nao derruba a sessao automaticamente: um 401 pode representar
 * permissao insuficiente em um recurso especifico, nao sessao invalida.
 */
api.interceptors.response.use(
  (res) => {
    stopLoading(res.config.url);
    return res;
  },
  (error) => {
    stopLoading(error.config?.url);
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const method = String(error.config?.method || 'GET').toUpperCase();
      const url = error.config?.url || 'unknown-url';
      console.warn(`[HTTP 401] ${method} ${url}`);
    }

    return Promise.reject(error);
  }
);

export default api;
