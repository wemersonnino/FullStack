import { ArrowLeftRight, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Shift } from '@/interfaces/shift/shift.interface';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { TrocasTurnoActions, TrocasTurnoDetailsButton } from './TrocasTurnoActions';

type TrocasTurnoViewProps = {
  trocas: ShiftSwap[];
  shifts: Shift[];
  canManage: boolean;
};

function statusLabel(status?: string) {
  const normalized = status ?? 'pending';
  return normalized.replaceAll('_', ' ').toUpperCase();
}

function statusVariant(status?: string) {
  if (['approved', 'effective', 'colleague_approved'].includes(status ?? '')) return 'secondary';
  if (['rejected', 'cancelled'].includes(status ?? '')) return 'destructive';
  return 'outline';
}

export function TrocasTurnoView({ trocas, shifts, canManage }: TrocasTurnoViewProps) {
  const pendingCount = trocas.filter(
    (troca) => !['approved', 'effective', 'rejected', 'cancelled'].includes(troca.status)
  ).length;

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeftRight className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Operacional</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trocas de Turno</h1>
          <p className="text-muted-foreground">
            Solicitações, aceite do colega e decisão final do gestor.
          </p>
        </div>
        <TrocasTurnoActions shifts={shifts} swaps={trocas} canManage={canManage} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Solicitações" value={trocas.length} />
        <SummaryCard label="Pendentes" value={pendingCount} />
        <SummaryCard label="Fonte" value="Controller Escalas e Trocas" compact />
      </div>

      <div className="grid gap-4">
        {trocas.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            Nenhuma solicitação encontrada.
          </div>
        ) : (
          trocas.map((troca) => (
            <div key={troca.id} className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {troca.requester?.username ?? troca.originalShift?.documentId ?? 'Solicitante'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {troca.originalShift?.date ?? 'Data não informada'}
                      {troca.compensationDate ? ` • Compensação ${troca.compensationDate}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant(troca.status)}>{statusLabel(troca.status)}</Badge>
                <TrocasTurnoDetailsButton swapId={troca.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, compact }: { label: string; value: string | number; compact?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={compact ? 'text-sm font-medium' : 'text-2xl font-semibold'}>{value}</p>
    </div>
  );
}
