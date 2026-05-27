import { CalendarDays } from 'lucide-react';

export function EscalaEmptyState({ title = 'Sem escalas no periodo' }: { title?: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-dashed bg-card/60 p-6 text-center">
      <div>
        <CalendarDays className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">Ajuste o periodo ou selecione outro dia.</p>
      </div>
    </div>
  );
}
