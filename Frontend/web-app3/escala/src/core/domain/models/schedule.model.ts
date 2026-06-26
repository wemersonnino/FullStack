export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  workMode: 'presencial' | 'remoto';
  status: string;
  notes?: string;
  employeeId: string;
  employeeName: string;
}

export interface ShiftSwap {
  id: string;
  requesterId: string;
  requesterName: string;
  originalShift?: Shift;
  compensationDate?: string;
  comments?: string;
  adminComments?: string;
  status: 'pending' | 'colleague_approved' | 'approved' | 'effective' | 'rejected' | 'cancelled';
  createdAt: string;
  decidedAt?: string;
}

export interface Schedule {
  id: string;
  year: number;
  month: number;
  shifts: Shift[];
}

export interface MonthCalendarDay {
  date: string;
  weekend: boolean;
  holiday: boolean;
  holidayName?: string | null;
  holidayType?: string | null;
}

export interface MonthCalendar {
  year: number;
  month: number;
  timezone: string;
  unitId?: number | null;
  days: MonthCalendarDay[];
}

export type ScheduleLegendImpact = 'WORKED' | 'REST' | 'ABSENCE' | 'NEUTRAL';

export interface ScheduleLegend {
  code: string;
  label: string;
  impact: ScheduleLegendImpact;
  plannedMinutes: number;
}
