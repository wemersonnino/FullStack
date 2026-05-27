'use client';

import { Escala } from '@/core/domain/escala/escala.types';
import { cn } from '@/lib/utils';
import { monthGridDays, toDateKey } from '../hooks/useEscalaCalendar';

export function EscalaMiniCalendar({
  cursor,
  escalasByDay,
  selectedDay,
  onSelectDay,
}: {
  cursor: Date;
  escalasByDay: Record<string, Escala[]>;
  selectedDay: string;
  onSelectDay: (date: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="mb-3 text-sm font-medium capitalize">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(cursor)}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {monthGridDays(cursor).map((day) => {
          const key = toDateKey(day);
          const hasEscala = (escalasByDay[key] ?? []).length > 0;
          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelectDay(key)}
              className={cn(
                'grid aspect-square place-items-center rounded hover:bg-muted',
                day.getMonth() !== cursor.getMonth() && 'opacity-30',
                hasEscala && 'bg-primary/15 text-primary',
                selectedDay === key && 'ring-1 ring-primary'
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
