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
  };
};

type AuthProvider = 'credentials' | 'google' | 'unknown';

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
      avatarUrl: data.user.avatarUrl,
      address: data.user.address,
      cep: data.user.cep,
      street: data.user.street,
      number: data.user.number,
      complement: data.user.complement,
      neighborhood: data.user.neighborhood,
      city: data.user.city,
      state: data.user.state,
      position: data.user.position,
      function: data.user.function,
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
      avatarUrl: data.user.avatarUrl,
      address: data.user.address,
      cep: data.user.cep,
      street: data.user.street,
      number: data.user.number,
      complement: data.user.complement,
      neighborhood: data.user.neighborhood,
      city: data.user.city,
      state: data.user.state,
      position: data.user.position,
      function: data.user.function,
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
        avatarUrl: authUser.user.avatarUrl,
        address: authUser.user.address,
        cep: authUser.user.cep,
        street: authUser.user.street,
        number: authUser.user.number,
        complement: authUser.user.complement,
        neighborhood: authUser.user.neighborhood,
        city: authUser.user.city,
        state: authUser.user.state,
        position: authUser.user.position,
        function: authUser.user.function,
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

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user, account, session, trigger, profile }) {
      if (account?.provider === 'google' && account.id_token) {
        const authUser = await loginGoogleSpringBoot(account.id_token);
        if (authUser) {
          token.id = authUser.user.id;
          token.username = (authUser.user.username && authUser.user.username !== authUser.user.email) 
            ? authUser.user.username 
            : ((profile as any)?.name || (profile as any)?.given_name || "");
          token.email = authUser.user.email;
          token.roles = authUser.user.roles;
          token.theme = authUser.user.theme;
          token.avatarUrl = authUser.user.avatarUrl || (profile as any)?.picture || (profile as any)?.image || null;
          token.address = authUser.user.address;
          token.cep = authUser.user.cep;
          token.street = authUser.user.street;
          token.number = authUser.user.number;
          token.complement = authUser.user.complement;
          token.neighborhood = authUser.user.neighborhood;
          token.city = authUser.user.city;
          token.state = authUser.user.state;
          token.position = authUser.user.position;
          token.function = authUser.user.function;
          token.accessToken = authUser.token;
          token.companySlug = authUser.user.companySlug;
          token.companyTheme = authUser.user.companyTheme;
          token.provider = 'google';
          return token;
        }
      }

      if (user) {
        token.id = user.id;
        token.username = user.username || (user as any).name || "";
        token.email = user.email;
        token.roles = user.roles;
        token.theme = user.theme;
        token.avatarUrl = user.avatarUrl || (user as any).image || null;
        token.address = user.address;
        token.cep = user.cep;
        token.street = user.street;
        token.number = user.number;
        token.complement = user.complement;
        token.neighborhood = user.neighborhood;
        token.city = user.city;
        token.state = user.state;
        token.position = user.position;
        token.function = user.function;
        token.accessToken = (user as any).token;
        token.companySlug = (user as any).companySlug;
        token.companyTheme = (user as any).companyTheme;
        token.provider = (user as any).provider || 'credentials';
      }

      if (trigger === 'update' && session?.user) {
        token.username = session.user.username ?? token.username;
        token.email = session.user.email ?? token.email;
        token.theme = session.user.theme ?? token.theme;
        token.avatarUrl = session.user.avatarUrl ?? token.avatarUrl;
        token.address = session.user.address ?? token.address;
        token.cep = session.user.cep ?? token.cep;
        token.street = session.user.street ?? token.street;
        token.number = session.user.number ?? token.number;
        token.complement = session.user.complement ?? token.complement;
        token.neighborhood = session.user.neighborhood ?? token.neighborhood;
        token.city = session.user.city ?? token.city;
        token.state = session.user.state ?? token.state;
        token.position = session.user.position ?? token.position;
        token.function = session.user.function ?? token.function;
        token.provider = (session.user as any).provider ?? token.provider;
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
        avatarUrl: (token.avatarUrl as string | null) ?? null,
        address: (token.address as string) ?? '',
        cep: (token.cep as string) ?? '',
        street: (token.street as string) ?? '',
        number: (token.number as string) ?? '',
        complement: (token.complement as string) ?? '',
        neighborhood: (token.neighborhood as string) ?? '',
        city: (token.city as string) ?? '',
        state: (token.state as string) ?? '',
        position: (token.position as string) ?? '',
        function: (token.function as string) ?? '',
        token: (token.accessToken as string) ?? '',
        companySlug: (token.companySlug as string) ?? ENV.COMPANY_SLUG,
        companyTheme: (token.companyTheme as string) ?? 'system',
        provider: (token.provider as AuthProvider) ?? 'credentials',
      };
      return session;
    },
  },
  pages: { signIn: '/login' },
  debug: process.env.NODE_ENV === 'development',
};

const authHandler = NextAuth(authOptions);
export { authHandler as GET, authHandler as POST };
