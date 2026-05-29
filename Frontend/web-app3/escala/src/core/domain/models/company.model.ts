export interface Company {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  logoUrl?: string;
  active: boolean;
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    additionalInfo?: string;
  };
}
