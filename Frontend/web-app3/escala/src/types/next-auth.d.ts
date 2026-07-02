import { DefaultSession } from "next-auth";
import { ThemeEnum } from "@/interfaces/enums/theme.enum"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      roles: string[];
      theme: ThemeEnum;
      avatarUrl?: string | null;
      address?: string;
      cep?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      position?: string;
      function?: string;
      companySlug?: string;
      companyTheme?: string;
      provider?: string;
      planType?: string;
      trialExpiresAt?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    theme: ThemeEnum;
    avatarUrl?: string | null;
    address?: string;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    position?: string;
    function?: string;
    token: string;
    companySlug?: string;
    companyTheme?: string;
    provider?: string;
    planType?: string;
    trialExpiresAt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    roles: string[];
    theme: ThemeEnum;
    avatarUrl?: string | null;
    address?: string;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    position?: string;
    function?: string;
    accessToken: string;
    companySlug?: string;
    companyTheme?: string;
    provider?: string;
    planType?: string;
    trialExpiresAt?: string;
  }
}
