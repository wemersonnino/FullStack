import { api } from "./utils"
import { getSession } from "next-auth/react"

/**
 * Retorna cabeçalhos de autenticação se o usuário estiver logado
 */
async function getAuthHeaders() {
  const session = await getSession()
  const token = (session?.user as any)?.token
  const headers: Record<string, string> = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * GET genérico
 */
export async function httpGet<T = any>(url: string, params?: Record<string, any>): Promise<T | null> {
  try {
    const headers = await getAuthHeaders()
    const res = await api.get<T>(url, { params, headers })
    return res.data
  } catch (error) {
    console.error(`[GET] ${url}`, error)
    return null
  }
}

/**
 * POST genérico
 */
export async function httpPost<T = any>(url: string, body: any): Promise<T | null> {
  try {
    const headers = await getAuthHeaders()
    const res = await api.post<T>(url, body, { headers })
    return res.data
  } catch (error) {
    console.error(`[POST] ${url}`, error)
    return null
  }
}

/**
 * PUT genérico
 */
export async function httpPut<T = any>(url: string, body: any): Promise<T | null> {
  try {
    const headers = await getAuthHeaders()
    const res = await api.put<T>(url, body, { headers })
    return res.data
  } catch (error) {
    console.error(`[PUT] ${url}`, error)
    return null
  }
}

/**
 * DELETE genérico
 */
export async function httpDelete<T = any>(url: string): Promise<T | null> {
  try {
    const headers = await getAuthHeaders()
    const res = await api.delete<T>(url, { headers })
    return res.data
  } catch (error) {
    console.error(`[DELETE] ${url}`, error)
    return null
  }
}
