import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// importa sua interface se quiser reaproveitar
import type { User as AppUser } from "@/interfaces/user/user.interface";

declare module "next-auth" {
  interface Session {
    user: AppUser & {
      token?: string;
    };
  }

  interface User extends DefaultUser {
    id: string | number;
    roles: string[];
    theme?: "light" | "dark" | "system";
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | number;
    name?: string;
    email?: string;
    roles?: string[];
    theme?: string;
    accessToken?: string;
  }
}
