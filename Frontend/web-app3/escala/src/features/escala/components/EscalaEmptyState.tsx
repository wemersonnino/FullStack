import { CalendarDays } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

export function EscalaEmptyState({ title = 'Sem escalas no periodo' }: { title?: string }) {
  return (
    <Empty className="bg-card/60">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarDays />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>Ajuste o periodo ou selecione outro dia.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
