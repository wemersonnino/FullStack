import { api } from './axios';
import { getSession } from 'next-auth/react';

type RequestOptions = {
  authToken?: string;
  throwOnError?: boolean;
};

function resolveUrl(url: string) {
  if (!url.startsWith('/') || globalThis.window !== undefined) return url;
  return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
}

/**
 * Retorna cabeçalhos de autenticação caso o usuário esteja logado.
 */
async function getAuthHeaders(options?: RequestOptions) {
  const session = globalThis.window === undefined ? null : await getSession();
  const token = options?.authToken ?? (session?.user as any)?.token;
  const headers: Record<string, string> = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function getRequestHeaders(url: string, options?: RequestOptions) {
  if (url.startsWith('/api/server')) return {};
  return getAuthHeaders(options);
}

function getHttpErrorMessage(err: unknown, fallback: string) {
  const error = err as {
    message?: string;
    cause?: {
      response?: {
        data?: unknown;
      };
    };
    response?: {
      data?: unknown;
    };
  };
  const data = error.response?.data ?? error.cause?.response?.data;

  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.detail;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return error.message || fallback;
}

/**
 * Métodos HTTP genéricos.
 */
export async function httpGet<T = any>(
  url: string,
  params?: Record<string, any>,
  options?: RequestOptions
): Promise<T | null> {
  try {
    const headers = await getRequestHeaders(url, options);
    const res = await api.get<T>(resolveUrl(url), { params, headers });
    return res.data;
  } catch (err) {
    console.error(`[GET] ${url}`, err);
    return null;
  }
}

export async function httpPost<T = any>(url: string, body: any, options?: RequestOptions): Promise<T | null> {
  try {
    const headers = await getRequestHeaders(url, options);
    const res = await api.post<T>(resolveUrl(url), body, { headers });
    return res.data;
  } catch (err) {
    const message = getHttpErrorMessage(err, `Erro ao enviar dados para ${url}`);
    if (options?.throwOnError) throw new Error(message, { cause: err });
    console.warn(`[POST] ${url}: ${message}`);
    return null;
  }
}

export async function httpPut<T = any>(url: string, body: any, options?: RequestOptions): Promise<T | null> {
  try {
    const headers = await getRequestHeaders(url, options);
    const res = await api.put<T>(resolveUrl(url), body, { headers });
    return res.data;
  } catch (err) {
    const message = getHttpErrorMessage(err, `Erro ao atualizar dados em ${url}`);
    if (options?.throwOnError) throw new Error(message, { cause: err });
    console.warn(`[PUT] ${url}: ${message}`);
    return null;
  }
}

export async function httpPatch<T = any>(url: string, body: any, options?: RequestOptions): Promise<T | null> {
  try {
    const headers = await getRequestHeaders(url, options);
    const res = await api.patch<T>(resolveUrl(url), body, { headers });
    return res.data;
  } catch (err) {
    const message = getHttpErrorMessage(err, `Erro ao atualizar dados em ${url}`);
    if (options?.throwOnError) throw new Error(message, { cause: err });
    console.warn(`[PATCH] ${url}: ${message}`);
    return null;
  }
}

export async function httpDelete<T = any>(
  url: string,
  options?: { params?: Record<string, any>; data?: any; authToken?: string; throwOnError?: boolean }
): Promise<T | null> {
  try {
    const headers = await getRequestHeaders(url, options);
    const res = await api.delete<T>(resolveUrl(url), { headers, params: options?.params, data: options?.data });
    return res.data;
  } catch (err) {
    const message = getHttpErrorMessage(err, `Erro ao remover dados em ${url}`);
    if (options?.throwOnError) throw new Error(message, { cause: err });
    console.warn(`[DELETE] ${url}: ${message}`);
    return null;
  }
}
