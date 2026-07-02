import { Session } from 'next-auth';

export type ClientSessionUser = Session['user'];

export function sanitizeClientUser<T extends object>(user: T): Omit<T, 'token'> {
  const { token: _token, ...safeUser } = user as T & { token?: string };
  return safeUser;
}
