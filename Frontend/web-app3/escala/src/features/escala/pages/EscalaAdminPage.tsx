'use client';

import { Escala, SessionLikeUser, UsuarioEscala } from '@/core/domain/escala/escala.types';
import { EscalaDashboardAdmin } from '../components/EscalaDashboardAdmin';

export function EscalaAdminPage({ user, escalas, usuarios }: { user: SessionLikeUser; escalas: Escala[]; usuarios: UsuarioEscala[] }) {
  return <EscalaDashboardAdmin user={user} initialEscalas={escalas} usuarios={usuarios} />;
}
