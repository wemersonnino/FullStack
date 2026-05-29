import { Shift } from '@/interfaces/shift/shift.interface';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Clock } from 'lucide-react';

interface ShiftCardProps {
  shift: Shift;
}

export const ShiftCard = ({ shift }: ShiftCardProps) => {
  const date = parseISO(shift.date);
  
  return (
    <div className="bg-card text-card-foreground flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold capitalize">
            {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h4>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Turno Programado</span>
          </div>
          {shift.notes && (
            <p className="mt-2 text-sm italic opacity-80">
              &ldquo;{shift.notes}&rdquo;
            </p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {shift.workMode === 'remoto' ? 'Remoto' : 'Presencial'}
        </span>
      </div>
    </div>
  );
};
