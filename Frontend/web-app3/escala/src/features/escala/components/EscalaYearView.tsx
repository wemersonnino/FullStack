'use client';

import { useMemo } from 'react';
import { 
  format, 
  startOfYear, 
  eachMonthOfInterval, 
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
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Escala } from '@/interfaces/escala/escala.interface';
import { Holiday } from '@/interfaces/holiday.interface';

interface EscalaYearViewProps {
  currentDate: Date;
  escalas: Escala[];
  isAdmin?: boolean;
  holidays?: Holiday[];
}

export function EscalaYearView({ currentDate, escalas, holidays = [] }: EscalaYearViewProps) {
  const months = useMemo(() => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
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

  const dayNames = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  return (
    <div className="bg-background p-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const startDay = startOfWeek(monthStart, { weekStartsOn: 1 });
          const endDay = endOfWeek(monthEnd, { weekStartsOn: 1 });
          const days = eachDayOfInterval({ start: startDay, end: endDay });

          return (
            <section key={month.toString()} className="text-center">
              <h3 className="text-sm font-semibold capitalize text-foreground mb-4">
                {format(month, 'MMMM', { locale: ptBR })}
              </h3>
              <div className="grid grid-cols-7 text-[10px] text-muted-foreground mb-2">
                {dayNames.map((name, i) => (
                  <div key={i}>{name}</div>
                ))}
              </div>
              <div className="isolate grid grid-cols-7 gap-px rounded-lg bg-muted/20 border overflow-hidden">
                {days.map((day) => {
                  const dayEscalas = getEscalasForDay(day);
                  const holiday = getHolidayForDay(day);
                  const isCurrentMonth = isSameMonth(day, month);
                  const hasEscala = dayEscalas.length > 0;

                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "relative py-1.5 focus:z-10 text-xs",
                        isCurrentMonth ? "bg-card text-foreground" : "bg-muted/50 text-muted-foreground/30",
                        holiday && isCurrentMonth && "bg-red-500/5"
                      )}
                    >
                      <time
                        dateTime={format(day, 'yyyy-MM-dd')}
                        className={cn(
                          "mx-auto flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                          isToday(day) && "bg-primary text-primary-foreground font-bold",
                          !isToday(day) && hasEscala && "bg-primary/20 text-primary font-semibold ring-1 ring-primary/30",
                          !isToday(day) && holiday && isCurrentMonth && "text-red-500 font-bold",
                          !isToday(day) && !hasEscala && !isCurrentMonth && "opacity-50"
                        )}
                        title={holiday?.name}
                      >
                        {format(day, 'd')}
                      </time>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
