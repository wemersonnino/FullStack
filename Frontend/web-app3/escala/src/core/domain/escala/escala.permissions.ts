import { EscalaRole, SessionLikeUser } from './escala.types';

function normalizeRoles(user?: SessionLikeUser | null) {
  return (user?.roles ?? []).map((role) => role.toUpperCase());
}

export function isAdmin(user?: SessionLikeUser | null) {
  return normalizeRoles(user).includes(EscalaRole.ADMIN);
}

export function canManageEscala(user?: SessionLikeUser | null) {
  return isAdmin(user);
}

export function canViewAllEscalas(user?: SessionLikeUser | null) {
  return isAdmin(user);
}

export function canViewOwnEscala(user?: SessionLikeUser | null) {
  const roles = normalizeRoles(user);
  return (
    isAdmin(user) ||
    roles.includes(EscalaRole.FUNCIONARIO) ||
    roles.includes(EscalaRole.USER) ||
    roles.includes(EscalaRole.MEMBER)
  );
}
