'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Escala, SessionLikeUser, UsuarioEscala } from '@/core/domain/escala/escala.types';
import { useEscalaPermissions } from '../hooks/useEscalaPermissions';
import { EscalaCalendar } from '../components/EscalaCalendar';

export function EscalaPage({ user, escalas, usuarios }: { user: SessionLikeUser; escalas: Escala[]; usuarios?: UsuarioEscala[] }) {
  const permissions = useEscalaPermissions(user);

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{permissions.canViewAllEscalas ? 'Visao geral' : 'Minha escala'}</p>
          <h1 className="text-2xl font-semibold">Calendario de escalas</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {permissions.canViewAllEscalas
              ? 'Acompanhe escalas por mes, semana e ano com detalhes por dia.'
              : 'Acompanhe suas escalas e solicite troca quando necessario.'}
          </p>
        </div>
        {permissions.canManageEscala && (
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/escala/admin">Abrir gestao</Link>
          </Button>
        )}
      </div>
      <EscalaCalendar user={user} initialEscalas={escalas} usuarios={usuarios} />
    </section>
  );
}
