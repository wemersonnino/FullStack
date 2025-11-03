import { CalendarEvent } from "@/interfaces/calendar/calendar.interface";

export function mapCalendarEvent(item: any): CalendarEvent {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    date_start: item.start_date,
    date_end: item.end_date,
    event_type: item.type,
    color: item.color || "#EFB252",
  };
}

export function mapCalendarEvents(data: any[]): CalendarEvent[] {
  return data.map(mapCalendarEvent);
}
