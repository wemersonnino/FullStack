'use client';

import { useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  parseISO,
  addHours,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Escala } from '@/interfaces/escala/escala.interface';
import { Holiday } from '@/interfaces/holiday.interface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EscalaWeekViewProps {
  currentDate: Date;
  escalas: Escala[];
  isAdmin?: boolean;
  holidays?: Holiday[];
}

export function EscalaWeekView({ currentDate, escalas, isAdmin, holidays = [] }: EscalaWeekViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getHolidayForDay = (day: Date) => {
    return holidays.find(holiday => {
      try {
        return isSameDay(parseISO(holiday.date), day);
      } catch {
        return false;
      }
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEscalasForDayAndHour = (day: Date, hour: number) => {
    return escalas.filter(escala => {
      if (!escala.data || !escala.horarioInicio) return false;
      try {
        const escalaDate = parseISO(escala.data);
        const startHour = parseInt(escala.horarioInicio.split(':')[0]);
        return isSameDay(escalaDate, day) && startHour === hour;
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="flex flex-col h-full min-w-[1000px] overflow-x-auto">
      <div className="sticky top-0 z-10 grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/30 backdrop-blur">
        <div className="border-r py-3" />
        {days.map(day => {
          const holiday = getHolidayForDay(day);
          return (
            <div key={day.toString()} className={cn(
              "border-r py-3 text-center last:border-r-0 relative",
              holiday && "bg-red-50/50 dark:bg-red-950/20"
            )}>
              {holiday && (
                <div className="absolute top-1 left-1 right-1 overflow-hidden">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-[8px] font-bold text-red-500 truncate uppercase">
                          {holiday.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{holiday.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <p className={cn(
                "text-xs font-medium uppercase mt-2",
                isToday(day) ? "text-primary" : (holiday ? "text-red-500" : "text-muted-foreground")
              )}>
                {format(day, 'EEE', { locale: ptBR })}
              </p>
              <p className={cn(
                "text-lg font-bold mt-1 inline-flex items-center justify-center h-8 w-8 rounded-full",
                isToday(day) && "bg-primary text-primary-foreground",
                holiday && !isToday(day) && "text-red-600 dark:text-red-400"
              )}>
                {format(day, 'd')}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] isolate">
          {hours.map(hour => (
            <div key={hour} className="contents group">
              <div className="relative border-r border-b h-20 px-2 py-1 text-[10px] text-muted-foreground text-right font-medium">
                <span className="sticky top-0">{format(addHours(startOfDay(new Date()), hour), 'HH:mm')}</span>
              </div>
              
              {days.map((day, dayIdx) => {
                const hourEscalas = getEscalasForDayAndHour(day, hour);
                const holiday = getHolidayForDay(day);
                return (
                  <div 
                    key={`${day}-${hour}`} 
                    className={cn(
                      "relative border-r border-b h-20 p-1 transition-colors hover:bg-muted/5",
                      holiday && "bg-red-50/10 dark:bg-red-950/5",
                      dayIdx === 6 && "border-r-0"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      {hourEscalas.map(escala => (
                        <TooltipProvider key={escala.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "flex items-center gap-2 p-1.5 rounded-lg border text-xs shadow-sm cursor-default overflow-hidden",
                                escala.workMode === 'PRESENCIAL' ? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400" :
                                escala.workMode === 'REMOTO' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                              )}>
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={escala.avatarUrl} />
                                  <AvatarFallback className="text-[8px]">{escala.nomeUsuario?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate">{isAdmin ? escala.nomeUsuario : escala.workMode}</p>
                                  <p className="text-[9px] opacity-80">{escala.horarioInicio}-{escala.horarioFim}</p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-bold">{escala.nomeUsuario}</p>
                                <p className="text-xs">{escala.cargo}</p>
                                <p className="text-xs font-mono">{escala.horarioInicio} - {escala.horarioFim}</p>
                                <p className="text-xs text-muted-foreground">{escala.setor}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
