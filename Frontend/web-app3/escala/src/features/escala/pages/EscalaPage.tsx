import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Escala, SessionLikeUser, UsuarioEscala } from '@/core/domain/escala/escala.types';
import { Escala as LegacyEscala } from '@/interfaces/escala/escala.interface';
import { canManageEscala, canViewAllEscalas } from '@/core/domain/escala/escala.permissions';
import { EscalaPageClient } from '../components/EscalaPageClient';

export function EscalaPage({ user, escalas, usuarios }: { user: SessionLikeUser; escalas: Escala[]; usuarios?: UsuarioEscala[] }) {
  const canViewAll = canViewAllEscalas(user);
  const canManage = canManageEscala(user);
  const calendarEscalas = escalas.map(mapToCalendarEscala);

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{canViewAll ? 'Visao geral' : 'Minha escala'}</p>
          <h1 className="text-2xl font-semibold">Calendario de escalas</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {canViewAll
              ? 'Acompanhe escalas por mes, semana e ano com detalhes por dia.'
              : 'Acompanhe suas escalas e solicite troca quando necessario.'}
          </p>
        </div>
        {canManage && (
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/escala/admin">Abrir gestao</Link>
          </Button>
        )}
      </div>
      <EscalaPageClient escalas={calendarEscalas} usuarios={usuarios} canViewAllEscalas={canViewAll} />
    </section>
  );
}

function mapToCalendarEscala(escala: Escala): LegacyEscala {
  const remoto = escala.remoto ?? false;

  return {
    id: String(escala.id),
    usuarioId: String(escala.usuarioId),
    nomeUsuario: escala.nomeUsuario,
    avatarUrl: escala.avatarUrl ?? undefined,
    cargo: escala.cargo ?? undefined,
    email: escala.email ?? undefined,
    role: escala.role ?? undefined,
    data: escala.dataInicio,
    horarioInicio: escala.horarioInicio ?? '08:00',
    horarioFim: escala.horarioFim ?? '17:00',
    setor: escala.setorNome ?? escala.setor ?? undefined,
    projeto: escala.projetoNome ?? escala.projeto ?? undefined,
    local: escala.local ?? undefined,
    remoto,
    status: escala.status ?? 'AGENDADA',
    workMode: remoto ? 'REMOTO' : 'PRESENCIAL',
    observacao: escala.observacao ?? undefined,
  };
}
