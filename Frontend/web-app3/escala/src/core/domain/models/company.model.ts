export interface Company {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  logoUrl?: string;
  active: boolean;
  latitude?: number;
  longitude?: number;
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    additionalInfo?: string;
    latitude?: number; // Permite em ambos para flexibilidade, mas o core usa no topo
    longitude?: number;
  };
}
