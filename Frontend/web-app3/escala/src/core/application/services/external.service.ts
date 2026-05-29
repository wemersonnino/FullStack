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
    
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async lookupCnpj(cnpj: string): Promise<BrasilApiCnpj | null> {
    // Remove pontuação mas preserva letras (Novo CNPJ Alfanumérico)
    const cleanCnpj = cnpj.replace(/[^\w]/g, '');
    if (cleanCnpj.length !== 14) return null;

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}
