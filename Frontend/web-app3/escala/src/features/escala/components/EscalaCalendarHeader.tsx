'use client';

import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EscalaViewMode } from '@/core/domain/escala/escala.types';
import { formatMonthYear } from '../hooks/useEscalaCalendar';

type Props = {
  cursor: Date;
  viewMode: EscalaViewMode;
  canManage: boolean;
  onViewModeChange: (mode: EscalaViewMode) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onAdd?: () => void;
};

export function EscalaCalendarHeader({
  cursor,
  viewMode,
  canManage,
  onViewModeChange,
  onToday,
  onPrevious,
  onNext,
  onAdd,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Calendario de escalas</p>
        <h1 className="truncate text-2xl font-semibold capitalize">{viewMode === 'year' ? cursor.getFullYear() : formatMonthYear(cursor)}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onToday}>
          Hoje
        </Button>
        <div className="flex rounded-md border">
          <Button type="button" variant="ghost" size="icon" className="rounded-r-none" onClick={onPrevious} aria-label="Periodo anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="rounded-l-none" onClick={onNext} aria-label="Proximo periodo">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as EscalaViewMode)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mes</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
        {canManage && (
          <Button type="button" size="sm" onClick={onAdd}>
            <CalendarPlus className="size-4" />
            Adicionar escala
          </Button>
        )}
      </div>
    </div>
  );
}
