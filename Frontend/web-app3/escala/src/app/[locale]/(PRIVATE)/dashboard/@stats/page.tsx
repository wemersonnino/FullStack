import { DashboardStats } from '@/core/domain/models/stats.model';
import { StatsService } from '@/core/application/services/stats.service';
import { Users, AlertTriangle, ArrowLeftRight, Activity } from 'lucide-react';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';

export default async function StatsSlot() {
  const { accessToken, session } = await getRequiredServerAuth();
  const roles = session.user.roles ?? [];
  const isManagerOrAdmin =
    roles.includes('ADMIN') ||
    roles.includes('OWNER') ||
    roles.some((role) => role.startsWith('MANAGER'));

  if (!isManagerOrAdmin) {
    return null;
  }

  let stats: DashboardStats;
  try {
    stats = await StatsService.getSummary(accessToken);
  } catch (error) {
    console.warn('Dashboard summary unavailable', error);
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Resumo estatistico indisponivel no momento.
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Colaboradores',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Escalas em Aberto',
      value: stats.openShifts,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      title: 'Trocas Pendentes',
      value: stats.pendingSwaps,
      icon: ArrowLeftRight,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Assiduidade (Mês)',
      value: `${stats.attendanceRate}%`,
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Pulso da operacao
          </p>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Resumo executivo do mes
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Indicadores essenciais para decidir antes de publicar, corrigir ou redistribuir escala.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardStatCard
            key={card.title}
            label={card.title}
            value={card.value}
            icon={card.icon}
            tone={
              card.title === 'Total Colaboradores'
                ? 'blue'
                : card.title === 'Escalas em Aberto'
                  ? 'amber'
                  : card.title === 'Trocas Pendentes'
                    ? 'rose'
                    : 'emerald'
            }
          />
        ))}
      </div>
    </section>
  );
}
