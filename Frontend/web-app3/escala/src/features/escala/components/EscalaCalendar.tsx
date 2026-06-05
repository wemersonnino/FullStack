'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  LayoutGrid,
  Rows,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EscalaMonthView } from './EscalaMonthView';
import { EscalaWeekView } from './EscalaWeekView';
import { EscalaYearView } from './EscalaYearView';
import { Escala } from '@/interfaces/escala/escala.interface';
import { Holiday } from '@/interfaces/holiday.interface';
import { getHolidays } from '@/services/holiday.service';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addYears, 
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewType = 'month' | 'week' | 'year';

interface EscalaCalendarProps {
  escalas: Escala[];
  isAdmin?: boolean;
  onDateChange?: (start: Date, end: Date) => void;
  onAddEvent?: () => void;
}

export function EscalaCalendar({ escalas, isAdmin, onDateChange, onAddEvent }: EscalaCalendarProps) {
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchHolidays = async () => {
      const data = await getHolidays(currentYear);
      setHolidays(data);
    };
    fetchHolidays();
  }, [currentYear]);

  const viewLabel = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    if (view === 'year') return format(currentDate, 'yyyy', { locale: ptBR });
    
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
  }, [view, currentDate]);

  const handlePrevious = () => {
    let nextDate = currentDate;
    if (view === 'month') nextDate = subMonths(currentDate, 1);
    else if (view === 'week') nextDate = subWeeks(currentDate, 1);
    else if (view === 'year') nextDate = subYears(currentDate, 1);
    setCurrentDate(nextDate);
    triggerDateChange(nextDate);
  };

  const handleNext = () => {
    let nextDate = currentDate;
    if (view === 'month') nextDate = addMonths(currentDate, 1);
    else if (view === 'week') nextDate = addWeeks(currentDate, 1);
    else if (view === 'year') nextDate = addYears(currentDate, 1);
    setCurrentDate(nextDate);
    triggerDateChange(nextDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    triggerDateChange(today);
  };

  const triggerDateChange = (date: Date) => {
    if (!onDateChange) return;
    let start, end;
    if (view === 'month') {
      start = startOfMonth(date);
      end = endOfMonth(date);
    } else if (view === 'week') {
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
    } else {
      start = new Date(date.getFullYear(), 0, 1);
      end = new Date(date.getFullYear(), 11, 31);
    }
    onDateChange(start, end);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-col gap-4 border-b bg-background px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-lg font-semibold capitalize">{viewLabel}</h2>
          <div className="flex w-fit items-center rounded-md border bg-muted/20 p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevious} aria-label="Periodo anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={handleToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext} aria-label="Proximo periodo">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {view === 'month' && <LayoutGrid className="h-4 w-4" />}
                {view === 'week' && <Rows className="h-4 w-4" />}
                {view === 'year' && <CalendarDays className="h-4 w-4" />}
                <span className="capitalize">{view === 'month' ? 'Mensal' : view === 'week' ? 'Semanal' : 'Anual'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setView('month')}>Mensal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('week')}>Semanal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('year')}>Anual</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAdmin && (
            <Button size="sm" className="gap-2" onClick={onAddEvent}>
              <CalendarIcon className="h-4 w-4" />
              Nova Escala
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b bg-muted/10 px-4 py-3 text-xs sm:px-6">
        <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300">Presencial</Badge>
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Remoto</Badge>
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">Pendente</Badge>
        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">Conflito/feriado</Badge>
        <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300">Troca solicitada</Badge>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'month' && <EscalaMonthView currentDate={currentDate} escalas={escalas} isAdmin={isAdmin} holidays={holidays} />}
        {view === 'week' && <EscalaWeekView currentDate={currentDate} escalas={escalas} isAdmin={isAdmin} holidays={holidays} />}
        {view === 'year' && <EscalaYearView currentDate={currentDate} escalas={escalas} isAdmin={isAdmin} holidays={holidays} />}
      </div>
    </div>
  );
}
