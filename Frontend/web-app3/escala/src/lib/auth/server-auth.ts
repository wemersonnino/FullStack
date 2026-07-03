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
const ACCESS_TOKEN_EXPIRY_SKEW_MS = 5_000;

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

function decodeJwtPayload(token?: string | null): Record<string, unknown> | null {
  if (!token) return null;
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function resolveAccessTokenExpiresAt(jwt: JWT): number | null {
  if (typeof jwt.accessTokenExpiresAt === 'number' && Number.isFinite(jwt.accessTokenExpiresAt)) {
    return jwt.accessTokenExpiresAt;
  }

  const payload = decodeJwtPayload(typeof jwt.accessToken === 'string' ? jwt.accessToken : null);
  const exp = payload?.exp;

  if (typeof exp === 'number' && Number.isFinite(exp)) {
    return exp * 1000;
  }

  if (typeof exp === 'string') {
    const parsed = Number.parseInt(exp, 10);
    if (Number.isFinite(parsed)) {
      return parsed * 1000;
    }
  }

  return null;
}

function hasValidAccessToken(jwt: JWT | null): jwt is JWT {
  if (!jwt || typeof jwt.accessToken !== 'string' || jwt.accessToken.trim() === '') {
    debugServerAuth('[DEBUG server-auth] access token missing');
    return false;
  }

  const expiresAt = resolveAccessTokenExpiresAt(jwt);
  if (expiresAt !== null && expiresAt <= Date.now() + ACCESS_TOKEN_EXPIRY_SKEW_MS) {
    debugServerAuth('[DEBUG server-auth] access token expired', { expiresAt });
    return false;
  }

  return true;
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
  if (!jwt?.id || !jwt?.email || !hasValidAccessToken(jwt)) {
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
  const token = hasValidAccessToken(jwt) ? jwt.accessToken : null;
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
