export interface WorkSchedule {
  id: number;
  user: number;
  fixed_days: string;
  alternating_day?: string;
  frequency: "every_week" | "every_two_weeks" | "monthly";
  minimum_weekly_shifts: number;
  active: boolean;
}

export interface Shift {
  id: number;
  date: string;
  status: "scheduled" | "completed" | "swapped";
  notes?: string;
}
