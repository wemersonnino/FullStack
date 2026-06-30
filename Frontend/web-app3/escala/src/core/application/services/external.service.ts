import { httpGet } from '@/lib/http/request';

export interface BrasilApiCep {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

export interface BrasilApiCnpj {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
}

export class ExternalDataService {
  static async lookupCep(cep: string): Promise<BrasilApiCep | null> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    return httpGet<BrasilApiCep>(`/api/bff/external/cep/${cleanCep}`);
  }

  static async lookupCnpj(cnpj: string): Promise<BrasilApiCnpj | null> {
    const cleanCnpj = cnpj.replace(/[^0-9A-Za-z]/g, '');
    if (cleanCnpj.length !== 14) return null;

    return httpGet<BrasilApiCnpj>(`/api/bff/external/cnpj/${cleanCnpj}`);
  }
}
