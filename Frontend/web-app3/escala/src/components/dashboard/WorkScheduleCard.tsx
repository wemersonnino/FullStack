import { WorkSchedule } from '@/interfaces/shift/work-schedule.interface';
import { CalendarRange, Info, CheckCircle2 } from 'lucide-react';

interface WorkScheduleCardProps {
  schedule: WorkSchedule;
}

export const WorkScheduleCard = ({ schedule }: WorkScheduleCardProps) => {
  const frequencyLabels = {
    every_week: 'Semanal',
    every_two_weeks: 'Quinzenal',
    monthly: 'Mensal',
  };

  const dayLabels = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex h-10 w-10 items-center justify-center rounded-full">
            <CalendarRange className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">Horário de Trabalho Fixo</h3>
        </div>
        {schedule.active && (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3" /> Ativo
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <span className="text-muted-foreground block text-sm font-medium uppercase tracking-wider">Dias Fixos</span>
            <p className="mt-1 text-lg font-semibold">{schedule.fixedDays || 'Não definido'}</p>
          </div>
          
          {schedule.alternatingDay && (
            <div>
              <span className="text-muted-foreground block text-sm font-medium uppercase tracking-wider">Dia Alternado</span>
              <p className="mt-1 text-lg font-semibold">{dayLabels[schedule.alternatingDay]}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-muted-foreground block text-sm font-medium uppercase tracking-wider">Frequência</span>
            <p className="mt-1 text-lg font-semibold">{frequencyLabels[schedule.frequency]}</p>
          </div>

          <div>
            <span className="text-muted-foreground block text-sm font-medium uppercase tracking-wider">Mínimo de Turnos/Semana</span>
            <p className="mt-1 text-lg font-semibold">{schedule.minimumWeeklyShifts} turnos</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 mt-6 flex items-start gap-3 rounded-lg p-4 text-sm">
        <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-muted-foreground leading-relaxed">
          Este horário representa sua escala padrão. Alterações pontuais devem ser solicitadas via troca de escala ou comunicadas à gerência.
        </p>
      </div>
    </div>
  );
};
