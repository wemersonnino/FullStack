import { ThemeEnum } from "@/interfaces/enums/theme.enum";

export interface Address {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  additionalInfo?: string; // Mapped from 'address' in DTO
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roles: string[];
  theme: ThemeEnum;
  avatarUrl?: string | null;
  position?: string;
  function?: string;
  address: Address;
  company?: {
    id?: string;
    slug?: string;
    name?: string;
    theme?: string;
  };
}
