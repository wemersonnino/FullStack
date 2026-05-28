"use client"

import * as React from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import type { Locale } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CalendarProps = {
  mode?: "single" | "multiple"
  selected?: Date | Date[]
  onSelect?: (date: Date | Date[] | undefined) => void
  locale?: Locale
  className?: string
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  locale,
  className,
}: CalendarProps) {
  const selectedDates = React.useMemo(
    () => (Array.isArray(selected) ? selected : selected ? [selected] : []),
    [selected]
  )
  const [month, setMonth] = React.useState(() => selectedDates[0] ?? new Date())

  const monthStart = startOfMonth(month)
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0, locale }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0, locale }),
  })
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"]

  function handleSelect(day: Date) {
    if (mode === "multiple") {
      const exists = selectedDates.some((selectedDay) => isSameDay(selectedDay, day))
      const next = exists
        ? selectedDates.filter((selectedDay) => !isSameDay(selectedDay, day))
        : [...selectedDates, day]

      onSelect?.(next)
      return
    }

    onSelect?.(day)
  }

  return (
    <div className={cn("w-full rounded-md bg-background p-3", className)}>
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setMonth((current) => subMonths(current, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Mes anterior</span>
        </Button>
        <div className="text-sm font-medium capitalize">
          {format(month, "LLLL yyyy", { locale })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setMonth((current) => addMonths(current, 1))}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Proximo mes</span>
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.8rem] text-muted-foreground">
        {weekDays.map((day, index) => (
          <div key={`${day}-${index}`} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selectedDates.some((selectedDay) =>
            isSameDay(selectedDay, day)
          )

          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => handleSelect(day)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                !isSameMonth(day, month) && "text-muted-foreground opacity-40",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
