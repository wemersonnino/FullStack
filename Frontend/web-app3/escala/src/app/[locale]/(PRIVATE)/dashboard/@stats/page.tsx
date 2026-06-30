import { DashboardStats } from '@/core/domain/models/stats.model';
import { StatsService } from '@/core/application/services/stats.service';
import { Users, AlertTriangle, ArrowLeftRight, Activity } from 'lucide-react';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

export default async function StatsSlot() {
  const { accessToken } = await getRequiredServerAuth();

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
          <div className={`${card.bg} rounded-lg p-2`}>
            <card.icon className={`h-6 w-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <h4 className="text-2xl font-bold">{card.value}</h4>
          </div>
        </div>
      ))}
    </div>
  );
}
