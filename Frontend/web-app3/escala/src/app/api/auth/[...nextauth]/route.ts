import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { ENV } from '@/constants/env';

type SpringAuthResponse = {
  token: string;
  user: {
    id: number | string;
    username: string;
    email: string;
    roles?: string[];
    theme?: string;
    companySlug?: string;
    companyTheme?: string;
  };
};

async function loginSpringBoot(
  email: string,
  password: string,
  companySlug = ENV.COMPANY_SLUG,
  recaptchaToken?: string
) {
  const response = await fetch(`${ENV.API_INTERNAL_URL}/api/v1/auth/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, companySlug, recaptchaToken }),
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const data = (await response.json()) as SpringAuthResponse;
  if (!data || !data.token) return null;
  return {
    token: data.token,
    user: {
      id: data.user.id.toString(),
      username: data.user.username,
      email: data.user.email,
      roles: data.user.roles || [],
      theme: (data.user.theme as ThemeEnum) ?? ThemeEnum.SYSTEM,
      companySlug: data.user.companySlug,
      companyTheme: data.user.companyTheme,
    },
  };
}

async function loginGoogleSpringBoot(idToken: string, companySlug = ENV.COMPANY_SLUG) {
  const response = await fetch(`${ENV.API_INTERNAL_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, companySlug }),
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const data = (await response.json()) as SpringAuthResponse;
  if (!data || !data.token) return null;
  return {
    token: data.token,
    user: {
      id: data.user.id.toString(),
      username: data.user.username,
      email: data.user.email,
      roles: data.user.roles || [],
      theme: (data.user.theme as ThemeEnum) ?? ThemeEnum.SYSTEM,
      companySlug: data.user.companySlug,
      companyTheme: data.user.companyTheme,
    },
  };
}

const providers: AuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' },
      companySlug: { label: 'Company', type: 'text' },
      recaptchaToken: { label: 'reCAPTCHA', type: 'text' },
    },
    async authorize(credentials): Promise<any> {
      if (!credentials?.email || !credentials?.password) return null;

      const authUser = await loginSpringBoot(
        credentials.email,
        credentials.password,
        credentials.companySlug || ENV.COMPANY_SLUG,
        credentials.recaptchaToken
      );

      if (!authUser) return null;
      return {
        id: authUser.user.id,
        username: authUser.user.username,
        email: authUser.user.email,
        roles: authUser.user.roles,
        theme: authUser.user.theme,
        token: authUser.token,
        companySlug: authUser.user.companySlug,
        companyTheme: authUser.user.companyTheme,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  );
}

/**
 * 🔐 Exportamos o objeto de configuração para usar também no getServerSession()
 */
export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  providers,

  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && account.id_token) {
        const authUser = await loginGoogleSpringBoot(account.id_token);
        if (authUser) {
          token.id = authUser.user.id;
          token.username = authUser.user.username;
          token.email = authUser.user.email;
          token.roles = authUser.user.roles;
          token.theme = authUser.user.theme;
          token.accessToken = authUser.token;
          token.companySlug = authUser.user.companySlug;
          token.companyTheme = authUser.user.companyTheme;
          return token;
        }
      }
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.roles = user.roles;
        token.theme = user.theme;
        token.accessToken = user.token;
        token.companySlug = user.companySlug;
        token.companyTheme = user.companyTheme;
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
        companySlug: (token.companySlug as string) ?? ENV.COMPANY_SLUG,
        companyTheme: (token.companyTheme as string) ?? 'system',
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
