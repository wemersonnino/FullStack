import { api } from './axios';
import { getSession } from 'next-auth/react';

type RequestOptions = {
  authToken?: string;
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

/**
 * Métodos HTTP genéricos.
 */
export async function httpGet<T = any>(
  url: string,
  params?: Record<string, any>,
  options?: RequestOptions
): Promise<T | null> {
  try {
    const headers = await getAuthHeaders(options);
    const res = await api.get<T>(resolveUrl(url), { params, headers });
    return res.data;
  } catch (err) {
    console.error(`[GET] ${url}`, err);
    return null;
  }
}

export async function httpPost<T = any>(url: string, body: any, options?: RequestOptions): Promise<T | null> {
  try {
    const headers = await getAuthHeaders(options);
    const res = await api.post<T>(resolveUrl(url), body, { headers });
    return res.data;
  } catch (err) {
    console.error(`[POST] ${url}`, err);
    return null;
  }
}

export async function httpPut<T = any>(url: string, body: any, options?: RequestOptions): Promise<T | null> {
  try {
    const headers = await getAuthHeaders(options);
    const res = await api.put<T>(resolveUrl(url), body, { headers });
    return res.data;
  } catch (err) {
    console.error(`[PUT] ${url}`, err);
    return null;
  }
}

export async function httpPatch<T = any>(url: string, body: any, options?: RequestOptions): Promise<T | null> {
  try {
    const headers = await getAuthHeaders(options);
    const res = await api.patch<T>(resolveUrl(url), body, { headers });
    return res.data;
  } catch (err) {
    console.error(`[PATCH] ${url}`, err);
    return null;
  }
}

export async function httpDelete<T = any>(
  url: string,
  options?: { params?: Record<string, any>; data?: any; authToken?: string }
): Promise<T | null> {
  try {
    const headers = await getAuthHeaders(options);
    const res = await api.delete<T>(resolveUrl(url), { headers, params: options?.params, data: options?.data });
    return res.data;
  } catch (err) {
    console.error(`[DELETE] ${url}`, err);
    return null;
  }
}
