import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { canManageEscala, canViewAllEscalas } from '@/core/domain/escala/escala.permissions';

export async function requireEscalaSession() {
  const session = await getServerSession(authOptions);
  if (!session) return { response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  return { session };
}

export async function requireEscalaAdmin() {
  const state = await requireEscalaSession();
  if ('response' in state) return state;
  if (!canManageEscala(state.session.user)) {
    return { response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return state;
}

export async function requireCanViewAllEscalas() {
  const state = await requireEscalaSession();
  if ('response' in state) return state;
  if (!canViewAllEscalas(state.session.user)) {
    return { response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return state;
}
