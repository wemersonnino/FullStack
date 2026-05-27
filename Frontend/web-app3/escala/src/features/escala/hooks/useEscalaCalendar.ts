'use client';

import { useMemo, useState } from 'react';
import { Escala, EscalaViewMode } from '@/core/domain/escala/escala.types';

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfWeek(date: Date) {
  const current = new Date(date);
  const day = current.getDay();
  current.setDate(current.getDate() - day);
  current.setHours(0, 0, 0, 0);
  return current;
}

export function monthGridDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function weekDays(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

export function formatShortDay(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit' }).format(date);
}

export function groupEscalasByDay(escalas: Escala[]) {
  return escalas.reduce<Record<string, Escala[]>>((acc, escala) => {
    const key = escala.dataInicio.slice(0, 10);
    acc[key] = [...(acc[key] ?? []), escala];
    return acc;
  }, {});
}

export function useEscalaCalendar(escalas: Escala[]) {
  const [viewMode, setViewMode] = useState<EscalaViewMode>('month');
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => toDateKey(new Date()));
  const escalasByDay = useMemo(() => groupEscalasByDay(escalas), [escalas]);

  function today() {
    const next = new Date();
    setCursor(next);
    setSelectedDay(toDateKey(next));
  }

  function move(direction: -1 | 1) {
    setCursor((current) => {
      const next = new Date(current);
      if (viewMode === 'week') next.setDate(next.getDate() + direction * 7);
      if (viewMode === 'month') next.setMonth(next.getMonth() + direction);
      if (viewMode === 'year') next.setFullYear(next.getFullYear() + direction);
      return next;
    });
  }

  return {
    viewMode,
    setViewMode,
    cursor,
    setCursor,
    selectedDay,
    setSelectedDay,
    escalasByDay,
    today,
    move,
  };
}
