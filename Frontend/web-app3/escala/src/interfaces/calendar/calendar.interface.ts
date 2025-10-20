export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date_start: string;
  date_end: string;
  event_type: "meeting" | "holiday" | "personal" | "training";
  color?: string;
  location?: string;
  is_recurring?: boolean;
}
