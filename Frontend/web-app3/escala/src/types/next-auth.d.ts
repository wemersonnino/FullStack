import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { ThemeEnum } from "@/interfaces/enums/theme.enum"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      roles: string[];
      theme: ThemeEnum;
      token: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    theme: ThemeEnum;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    roles: string[];
    theme: ThemeEnum;
    accessToken: string;
  }
}