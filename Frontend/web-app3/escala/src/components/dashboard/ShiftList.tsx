import { Shift } from '@/interfaces/shift/shift.interface';
import { ShiftCard } from './ShiftCard';
import { Calendar } from 'lucide-react';

interface ShiftListProps {
  shifts: Shift[];
}

export const ShiftList = ({ shifts }: ShiftListProps) => {
  if (shifts.length === 0) {
    return (
      <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <Calendar className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
        <h3 className="text-lg font-medium">Nenhuma escala encontrada</h3>
        <p className="text-muted-foreground text-sm">
          Você não possui turnos programados para este período.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Suas Próximas Escalas</h2>
        <span className="text-muted-foreground text-sm">
          {shifts.length} {shifts.length === 1 ? 'turno' : 'turnos'}
        </span>
      </div>
      
      <div className="grid gap-4">
        {shifts.map((shift) => (
          <ShiftCard key={shift.id} shift={shift} />
        ))}
      </div>
    </div>
  );
};
