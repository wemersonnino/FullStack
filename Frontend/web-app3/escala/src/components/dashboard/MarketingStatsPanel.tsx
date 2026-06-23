import { Bot, ChartNoAxesCombined, Megaphone, MousePointerClick, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MarketingStats } from '@/services/marketing-stats.service';

type Props = {
  stats: MarketingStats;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}

export function MarketingStatsPanel({ stats }: Props) {
  const conversion = Math.max(0, Math.min(stats.conversionRate, 100));
  const paidShare = stats.totalLeads > 0 ? Math.min((stats.convertedToPaid / stats.totalLeads) * 100, 100) : 0;
  const trialShare = stats.totalLeads > 0 ? Math.min((stats.activeTrials / stats.totalLeads) * 100, 100) : 0;

  const metrics = [
    {
      label: 'Leads capturados',
      value: formatNumber(stats.totalLeads),
      icon: Users,
      tone: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Trials ativos',
      value: formatNumber(stats.activeTrials),
      icon: MousePointerClick,
      tone: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Convertidos para pago',
      value: formatNumber(stats.convertedToPaid),
      icon: TrendingUp,
      tone: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Uso de IA no mês',
      value: formatNumber(stats.aiRequestsThisMonth),
      icon: Bot,
      tone: 'bg-violet-100 text-violet-700',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl space-y-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Megaphone className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Marketing</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Métricas de aquisição</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Visão administrativa dos leads, trials, conversões e uso de IA relacionados ao funil comercial.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit">
          Acesso restrito
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight">{metric.value}</p>
              </div>
              <div className={`rounded-md p-2 ${metric.tone}`}>
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Conversão do funil</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Leads para clientes pagos</span>
                <span className="font-semibold">{formatPercent(conversion)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${conversion}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trials ativos sobre leads</span>
                <span className="font-semibold">{formatPercent(trialShare)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${trialShare}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Clientes pagos sobre leads</span>
                <span className="font-semibold">{formatPercent(paidShare)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-sky-600" style={{ width: `${paidShare}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Leitura rápida</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Cada trial ativo representa uma empresa em avaliação do produto. A taxa de conversão considera leads totais contra clientes pagos.
            </p>
            <p>
              O uso mensal de IA ajuda a medir adoção de recursos inteligentes e pode orientar campanhas segmentadas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
