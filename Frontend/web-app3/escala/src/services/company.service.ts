import { httpDelete, httpGet, httpPost, httpPut } from '@/lib/http/request';

const BASE_URL = '/api/bff/companies';

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
  const response = await httpGet<Company[]>(BASE_URL);
  return response || [];
}

export async function getCompany(id: number | string): Promise<Company | null> {
  return await httpGet<Company>(`${BASE_URL}/${id}`);
}

export async function createCompany(data: Partial<Company>): Promise<Company | null> {
  return await httpPost<Company>(BASE_URL, data);
}

export async function updateCompany(id: number | string, data: Partial<Company>): Promise<Company | null> {
  return await httpPut<Company>(`${BASE_URL}/${id}`, data);
}

export async function deleteCompany(id: number | string): Promise<boolean> {
  const response = await httpDelete(`${BASE_URL}/${id}`);
  return !!response;
}
