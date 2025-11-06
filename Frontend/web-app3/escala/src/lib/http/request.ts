import { api } from './axios';
import { getSession } from 'next-auth/react';

/**
 * Retorna cabeçalhos de autenticação caso o usuário esteja logado.
 */
async function getAuthHeaders() {
  if (globalThis.window === undefined) return {};

  const session = await getSession();
  const token = (session?.user as any)?.token;
  const headers: Record<string, string> = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Métodos HTTP genéricos.
 */
export async function httpGet<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await api.get<T>(url, { params, headers });
    return res.data;
  } catch (err) {
    console.error(`[GET] ${url}`, err);
    return null;
  }
}

export async function httpPost<T = any>(url: string, body: any): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await api.post<T>(url, body, { headers });
    return res.data;
  } catch (err) {
    console.error(`[POST] ${url}`, err);
    return null;
  }
}

export async function httpPut<T = any>(url: string, body: any): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await api.put<T>(url, body, { headers });
    return res.data;
  } catch (err) {
    console.error(`[PUT] ${url}`, err);
    return null;
  }
}

export async function httpDelete<T = any>(url: string): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await api.delete<T>(url, { headers });
    return res.data;
  } catch (err) {
    console.error(`[DELETE] ${url}`, err);
    return null;
  }
}
