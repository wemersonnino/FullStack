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

  const getEscalasForDay = (day: Date) => {
    return escalas.filter(escala => {
      if (!escala.data) return false;
      try {
        return isSameDay(parseISO(escala.data), day);
      } catch {
        return false;
      }
    });
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

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="flex flex-col h-full min-w-[800px]">
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
                "relative min-h-[120px] p-2 border-r border-b group transition-colors hover:bg-muted/5 cursor-pointer",
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
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-default",
                          escala.workMode === 'PRESENCIAL' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                          escala.workMode === 'REMOTO' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        )}>
                          <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                          <span className="truncate">{isAdmin ? escala.nomeUsuario : escala.workMode}</span>
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
