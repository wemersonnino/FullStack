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
      token: string;
      companySlug?: string;
      companyTheme?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    theme: ThemeEnum;
    avatarUrl?: string | null;
    token: string;
    companySlug?: string;
    companyTheme?: string;
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
    accessToken: string;
    companySlug?: string;
    companyTheme?: string;
  }
}
