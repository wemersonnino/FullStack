'use client';

import { canManageEscala, canViewAllEscalas, canViewOwnEscala, isAdmin } from '@/core/domain/escala/escala.permissions';
import { SessionLikeUser } from '@/core/domain/escala/escala.types';

export function useEscalaPermissions(user?: SessionLikeUser | null) {
  return {
    isAdmin: isAdmin(user),
    canManageEscala: canManageEscala(user),
    canViewAllEscalas: canViewAllEscalas(user),
    canViewOwnEscala: canViewOwnEscala(user),
  };
}
