import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ThemeEnum } from "@/interfaces/enums/theme.enum";

/**
 * Função que faz login no Strapi e retorna JWT + dados do usuário
 */
async function loginStrapi(email: string, password: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API}/api/auth/local`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      },
    );

    if (!res.ok) return null;
    const data = await res.json();

    return {
      token: data.jwt,
      user: {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        roles: data.user.roles?.map((r: any) => r.name) ?? [],
        theme: data.user.theme ?? "system",
      },
    };
  } catch (error) {
    console.error("Erro ao conectar com Strapi:", error);
    return null;
  }
}

/**
 * Configuração principal do NextAuth
 */
const authHandler = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const strapiUser = await loginStrapi(
          credentials.email,
          credentials.password,
        );
        if (!strapiUser) return null;
        return {
          id: strapiUser.user.id,
          name: strapiUser.user.name,
          email: strapiUser.user.email,
          roles: strapiUser.user.roles,
          theme: strapiUser.user.theme,
          token: strapiUser.token,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.email = (user as any).email;
        token.roles = (user as any).roles ?? [];
        token.theme = (user as any).theme ?? "system";
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        username: token.name as string,
        email: token.email as string,
        roles: (token.roles as string[]) ?? [],
        theme: (token.theme as ThemeEnum) ?? ThemeEnum.SYSTEM,
        token: (token.accessToken as string) ?? "",
      };
      return session;
    },
  },

  pages: {
    signIn: "/(PUBLIC)/auth/login",
  },

  debug: process.env.NODE_ENV === "development",
});

export { authHandler as GET, authHandler as POST };
