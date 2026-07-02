import Link from 'next/link';
import { Building2, CalendarDays, Users, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Escala, SessionLikeUser, UsuarioEscala } from '@/core/domain/escala/escala.types';
import { Escala as LegacyEscala } from '@/interfaces/escala/escala.interface';
import { canManageEscala, canViewAllEscalas } from '@/core/domain/escala/escala.permissions';
import { EscalaPageClient } from '../components/EscalaPageClient';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';

export function EscalaPage({ user, escalas, usuarios }: { user: SessionLikeUser; escalas: Escala[]; usuarios?: UsuarioEscala[] }) {
  const canViewAll = canViewAllEscalas(user);
  const canManage = canManageEscala(user);
  const calendarEscalas = escalas.map(mapToCalendarEscala);
  const remoteCount = escalas.filter((escala) => escala.remoto).length;
  const presencialCount = escalas.length - remoteCount;
  const uniquePeople = new Set(escalas.map((escala) => escala.usuarioId)).size;

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <DashboardPageHeader
        eyebrow={canViewAll ? 'Visao Geral de Escala' : 'Minha Escala'}
        title={canViewAll ? 'Calendario classico para leitura, ajuste rapido e cobertura do mes.' : 'Sua agenda mensal com leitura clara de presenca, remoto e trocas.'}
        description={
          canViewAll
            ? 'Acompanhe a distribuicao de escalas por pessoa e por dia antes de migrar para decisao mais profunda na escala inteligente.'
            : 'Consulte seus turnos, entenda a distribuicao do periodo e siga para trocas ou ajustes quando necessario.'
        }
        actions={
          <>
            <Button type="button" variant="outline" className="rounded-2xl" asChild>
              <Link href="/dashboard/escala/trocas">Abrir trocas</Link>
            </Button>
            {canManage ? (
              <>
                <Button type="button" variant="outline" className="rounded-2xl" asChild>
                  <Link href="/dashboard/escala/inteligente">Escala inteligente</Link>
                </Button>
                <Button type="button" className="rounded-2xl" asChild>
                  <Link href="/dashboard/escala/admin">Abrir gestao</Link>
                </Button>
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Escalas no periodo"
          value={escalas.length}
          hint="Eventos carregados no calendario atual."
          icon={CalendarDays}
          tone="blue"
        />
        <DashboardStatCard
          label="Presencial"
          value={presencialCount}
          hint="Cobertura fisica prevista."
          icon={Building2}
          tone="amber"
        />
        <DashboardStatCard
          label="Remoto"
          value={remoteCount}
          hint="Dias operando fora do escritorio."
          icon={Wifi}
          tone="emerald"
        />
        <DashboardStatCard
          label="Pessoas"
          value={canViewAll ? uniquePeople : 1}
          hint={canViewAll ? 'Colaboradores distintos no periodo.' : 'Leitura focada na sua jornada.'}
          icon={Users}
          tone="slate"
        />
      </div>

      <div className="rounded-[32px] border bg-card p-3 shadow-sm md:p-5">
        <EscalaPageClient escalas={calendarEscalas} usuarios={usuarios} canViewAllEscalas={canViewAll} />
      </div>
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
