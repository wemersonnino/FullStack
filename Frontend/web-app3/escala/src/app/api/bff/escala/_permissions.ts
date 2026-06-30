import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { canManageEscala, canViewAllEscalas } from '@/core/domain/escala/escala.permissions';
import { SessionLikeUser } from '@/core/domain/escala/escala.types';

function decodeBearerUser(request?: Request): SessionLikeUser | null {
  const authorization = request?.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8')) as {
      id?: string | number;
      email?: string;
      roles?: string[] | string;
    };
    return {
      id: payload.id ?? null,
      email: payload.email ?? null,
      roles: Array.isArray(payload.roles)
        ? payload.roles
        : typeof payload.roles === 'string'
          ? [payload.roles]
          : [],
    };
  } catch {
    return null;
  }
}

export async function requireEscalaSession(request?: Request) {
  const session = await getServerSession(authOptions);
  if (session) {
    return { session };
  }

  const user = decodeBearerUser(request);
  if (user) {
    return { session: { user } };
  }

  return { response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
}

export async function requireEscalaAdmin(request?: Request) {
  const state = await requireEscalaSession(request);
  if ('response' in state) return state;
  if (!canManageEscala(state.session.user)) {
    return { response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return state;
}

export async function requireCanViewAllEscalas(request?: Request) {
  const state = await requireEscalaSession(request);
  if ('response' in state) return state;
  if (!canViewAllEscalas(state.session.user)) {
    return { response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return state;
}
