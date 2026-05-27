import { httpDelete, httpGet, httpPost, httpPut } from '@/lib/http/request';

export interface Company {
  id: number;
  name: string;
  cnpj: string;
  logo?: any;
  address?: string;
}

export async function getCompanies(): Promise<Company[]> {
  const response = await httpGet<{ data: any[] }>('/api/bff/companies');
  return response?.data?.map(item => ({ id: item.id, ...item.attributes })) || [];
}

export async function getCompany(id: number | string): Promise<Company | null> {
  const response = await httpGet<{ data: any }>(`/api/bff/companies/${id}`);
  if (!response?.data) return null;
  return { id: response.data.id, ...response.data.attributes };
}

export async function createCompany(data: Partial<Company>): Promise<Company | null> {
  const response = await httpPost<{ data: any }>('/api/bff/companies', { data });
  if (!response?.data) return null;
  return { id: response.data.id, ...response.data.attributes };
}

export async function updateCompany(id: number | string, data: Partial<Company>): Promise<Company | null> {
  const response = await httpPut<{ data: any }>(`/api/bff/companies/${id}`, { data });
  if (!response?.data) return null;
  return { id: response.data.id, ...response.data.attributes };
}

export async function deleteCompany(id: number | string): Promise<boolean> {
  const response = await httpDelete(`/api/bff/companies/${id}`);
  return !!response;
}
