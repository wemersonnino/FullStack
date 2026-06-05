import { httpDelete, httpGet, httpPost, httpPut } from '@/lib/http/request';

export interface Company {
  id: number;
  name: string;
  cnpj: string;
  logo?: { url?: string } | null;
  logoUrl?: string;
  address?:
    | {
        cep?: string;
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        additionalInfo?: string;
      }
    | string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export async function getCompanies(): Promise<Company[]> {
  const response = await httpGet<Company[]>('/api/bff/companies');
  return response || [];
}

export async function getCompany(id: number | string): Promise<Company | null> {
  return await httpGet<Company>(`/api/bff/companies/${id}`);
}

export async function createCompany(data: Partial<Company>): Promise<Company | null> {
  return await httpPost<Company>('/api/bff/companies', data);
}

export async function updateCompany(id: number | string, data: Partial<Company>): Promise<Company | null> {
  return await httpPut<Company>(`/api/bff/companies/${id}`, data);
}

export async function deleteCompany(id: number | string): Promise<boolean> {
  const response = await httpDelete(`/api/bff/companies/${id}`);
  return !!response;
}
