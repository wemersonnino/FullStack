import 'server-only';

import { cookies } from 'next/headers';
import { Session } from 'next-auth';
import { getToken, JWT } from 'next-auth/jwt';
import { redirect } from 'next/navigation';

type ServerAuthContext = {
  session: Session;
  accessToken: string;
};

const SERVER_AUTH_DEBUG = process.env.DEBUG_SERVER_AUTH === 'true';

function debugServerAuth(message: string, payload?: unknown) {
  if (!SERVER_AUTH_DEBUG) {
    return;
  }

  if (payload === undefined) {
    console.log(message);
    return;
  }

  console.log(message, payload);
}

async function readServerJwt(): Promise<JWT | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    debugServerAuth('[DEBUG server-auth] readServerJwt: No cookie header found');
    return null;
  }

  const cookiesMap: Record<string, string> = {};
  for (const cookie of cookieStore.getAll()) {
    cookiesMap[cookie.name] = cookie.value;
  }

  const jwt = await getToken({
    req: {
      headers: {
        cookie: cookieHeader,
      },
      cookies: cookiesMap,
    } as any,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  debugServerAuth('[DEBUG server-auth] readServerJwt: resolved JWT keys:', jwt ? Object.keys(jwt) : 'null');
  return jwt && typeof jwt === 'object' ? (jwt as JWT) : null;
}

function buildSessionFromJwt(jwt: JWT): Session {
  return {
    user: {
      id: String(jwt.id ?? ''),
      username: String(jwt.username ?? ''),
      email: String(jwt.email ?? ''),
      roles: Array.isArray(jwt.roles) ? jwt.roles.map(String) : [],
      theme: String(jwt.theme ?? 'system') as any,
      avatarUrl: typeof jwt.avatarUrl === 'string' ? jwt.avatarUrl : null,
      address: String(jwt.address ?? ''),
      cep: String(jwt.cep ?? ''),
      street: String(jwt.street ?? ''),
      number: String(jwt.number ?? ''),
      complement: String(jwt.complement ?? ''),
      neighborhood: String(jwt.neighborhood ?? ''),
      city: String(jwt.city ?? ''),
      state: String(jwt.state ?? ''),
      position: String(jwt.position ?? ''),
      function: String(jwt.function ?? ''),
      companySlug: String(jwt.companySlug ?? ''),
      companyTheme: String(jwt.companyTheme ?? 'system'),
      planType: String(jwt.planType ?? 'FREE'),
      trialExpiresAt: String(jwt.trialExpiresAt ?? ''),
      provider: String(jwt.provider ?? 'credentials') as any,
    },
    expires:
      typeof jwt.exp === 'number'
        ? new Date(jwt.exp * 1000).toISOString()
        : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

export async function getOptionalServerSession(): Promise<Session | null> {
  const jwt = await readServerJwt();
  if (!jwt?.id || !jwt?.email) {
    debugServerAuth('[DEBUG server-auth] getOptionalServerSession: missing id or email from JWT:', {
      id: jwt?.id,
      email: jwt?.email,
    });
    return null;
  }

  return buildSessionFromJwt(jwt);
}

export async function getOptionalServerAccessToken(): Promise<string | null> {
  const jwt = await readServerJwt();
  const token = typeof jwt?.accessToken === 'string' ? jwt.accessToken : null;
  debugServerAuth('[DEBUG server-auth] getOptionalServerAccessToken:', token ? 'exists' : 'null');
  return token;
}

export async function getRequiredServerAuth(): Promise<ServerAuthContext> {
  const session = await getOptionalServerSession();
  if (!session?.user) {
    debugServerAuth('[DEBUG server-auth] getRequiredServerAuth: Redirecting to /login due to missing session');
    redirect('/login');
  }

  const accessToken = await getOptionalServerAccessToken();
  if (!accessToken) {
    debugServerAuth('[DEBUG server-auth] getRequiredServerAuth: Redirecting to /login due to missing accessToken');
    redirect('/login');
  }

  return {
    session,
    accessToken,
  };
}
