import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { httpPost } from '@/lib/http/request';
import { API_ROUTES } from '@/constants/api';
import { StrapiLoginResponse } from '@/dto/strapiLogin.dto';

async function loginStrapi(email: string, password: string) {
  const data = await httpPost<StrapiLoginResponse>(API_ROUTES.AUTHENTICATOR, {
    identifier: email,
    password,
  });
  if (!data) return null;
  return {
    token: data.jwt,
    user: {
      id: data.user.id.toString(),
      username: data.user.username,
      email: data.user.email,
      roles: data.user.roles?.map((r) => r.name) ?? [],
      theme: (data.user.theme as ThemeEnum) ?? ThemeEnum.SYSTEM,
    },
  };
}

/**
 * 🔐 Exportamos o objeto de configuração para usar também no getServerSession()
 */
export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) return null;
        const strapiUser = await loginStrapi(credentials.email, credentials.password);
        if (!strapiUser) return null;
        return {
          id: strapiUser.user.id,
          username: strapiUser.user.username,
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
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.roles = user.roles;
        token.theme = user.theme;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        username: token.username as string,
        email: token.email as string,
        roles: (token.roles as string[]) ?? [],
        theme: (token.theme as ThemeEnum) ?? ThemeEnum.SYSTEM,
        token: (token.accessToken as string) ?? '',
      };
      return session;
    },
  },

  pages: { signIn: '/login' },
  debug: process.env.NODE_ENV === 'development',
};

/**
 * 🔄 Usa o objeto exportado acima para criar o handler
 */
const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };
