import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Escala } from '@/interfaces/escala/escala.interface';
import { Holiday } from '@/interfaces/holiday.interface';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EscalaDayDetails } from './EscalaDayDetails';

interface EscalaMonthViewProps {
  currentDate: Date;
  escalas: Escala[];
  isAdmin?: boolean;
  holidays?: Holiday[];
}

export function EscalaMonthView({ currentDate, escalas, isAdmin, holidays = [] }: EscalaMonthViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Optimize: Group scales by date string for O(1) lookup during cell rendering
  const escalasByDate = useMemo(() => {
    const map = new Map<string, Escala[]>();
    escalas.forEach(escala => {
      if (!escala.data) return;
      const dateKey = escala.data.split('T')[0]; // Ensure we only have the date part
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(escala);
    });
    return map;
  }, [escalas]);

  const getEscalasForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return escalasByDate.get(dateKey) || [];
  };

  const getHolidayForDay = (day: Date) => {
    return holidays.find(holiday => {
      try {
        return isSameDay(parseISO(holiday.date), day);
      } catch {
        return false;
      }
    });
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDetailsOpen(true);
  };

  function getEscalaBadgeClass(escala: Escala) {
    const status = escala.status?.toUpperCase();
    if (status?.includes('CONFLITO') || status === 'CANCELLED' || status === 'CANCELADA') {
      return 'bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300';
    }
    if (status?.includes('PEND') || status === 'PENDING') {
      return 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300';
    }
    if (status?.includes('TROCA') || status?.includes('SWAP')) {
      return 'bg-violet-500/10 text-violet-700 border-violet-500/30 dark:text-violet-300';
    }
    if (escala.workMode === 'REMOTO') {
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300';
    }
    return 'bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300';
  }

  function getEscalaBadgeLabel(escala: Escala) {
    const status = escala.status?.toUpperCase();
    if (status?.includes('CONFLITO')) return 'Conflito';
    if (status?.includes('PEND') || status === 'PENDING') return 'Pendente';
    if (status?.includes('TROCA') || status?.includes('SWAP')) return 'Troca';
    return isAdmin ? escala.nomeUsuario : escala.workMode === 'REMOTO' ? 'Remoto' : 'Presencial';
  }

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="flex h-full min-w-[820px] flex-col">
      <div className="grid grid-cols-7 border-b bg-muted/20">
        {dayNames.map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr isolate">
        {days.map((day, idx) => {
          const dayEscalas = getEscalasForDay(day);
          const holiday = getHolidayForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                "group relative min-h-[120px] cursor-pointer border-r border-b p-2 transition-colors hover:bg-muted/5 focus-within:bg-muted/5",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground/50",
                holiday && "bg-red-50/30 dark:bg-red-950/10",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex items-start justify-between">
                {holiday && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 max-w-[70%] truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span className="truncate uppercase">{holiday.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{holiday.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <time
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ml-auto transition-colors",
                    isToday(day) && "bg-primary text-primary-foreground",
                    !isToday(day) && isCurrentMonth && "text-foreground",
                    !isCurrentMonth && "text-muted-foreground/30",
                    holiday && !isToday(day) && "text-red-600 dark:text-red-400 font-bold",
                    "group-hover:ring-2 group-hover:ring-primary/20"
                  )}
                >
                  {format(day, 'd')}
                </time>
              </div>

              <div className="mt-2 space-y-1">
                {dayEscalas.slice(0, 3).map(escala => (
                  <TooltipProvider key={escala.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium cursor-default",
                          getEscalaBadgeClass(escala)
                        )}>
                          <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                          <span className="truncate">{getEscalaBadgeLabel(escala)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={escala.avatarUrl} />
                              <AvatarFallback>{escala.nomeUsuario?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold">{escala.nomeUsuario}</p>
                              <p className="text-xs text-muted-foreground">{escala.cargo}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Horário</p>
                              <p>{escala.horarioInicio} - {escala.horarioFim}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Modalidade</p>
                              <Badge variant="outline" className="text-[10px] h-4">{escala.workMode}</Badge>
                            </div>
                          </div>
                          {escala.setor && (
                            <div>
                              <p className="text-xs text-muted-foreground">Setor/Projeto</p>
                              <p className="text-xs">{escala.setor} {escala.projeto ? `/ ${escala.projeto}` : ''}</p>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {dayEscalas.length > 3 && (
                  <p className="text-[10px] text-muted-foreground pl-1">
                    + {dayEscalas.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EscalaDayDetails 
        date={selectedDate}
        escalas={selectedDate ? getEscalasForDay(selectedDate) : []}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        isAdmin={isAdmin}
      />
    </div>
  );
}
