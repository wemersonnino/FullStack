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

export type ScheduleHolidayType = 'NATIONAL' | 'STATE' | 'MUNICIPAL' | 'CUSTOM';

export interface ScheduleHoliday {
  id: number;
  date: string;
  name: string;
  type: ScheduleHolidayType;
  unitId?: number | null;
}

export interface CreateScheduleHolidayInput {
  date: string;
  name: string;
  type: ScheduleHolidayType;
  unitId?: number | null;
}

export type ScheduleCycleStatus = 'RASCUNHO' | 'EM_VALIDACAO' | 'PUBLICADO' | 'RETIFICADO' | 'ARQUIVADO';

export interface ScheduleCycle {
  id: string;
  year: number;
  month: number;
  unitId?: number | null;
  timezone: string;
  status: ScheduleCycleStatus;
  businessVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleCycleInput {
  year: number;
  month: number;
  unitId?: number | null;
  timezone?: string;
}

export interface ScheduleCycleAssignment {
  id: string;
  employeeId: number;
  employeeName: string;
  date: string;
  legendCode: string;
  legendLabel: string;
  legendImpact: ScheduleLegendImpact;
  plannedMinutes: number;
  modality: 'PRESENCIAL' | 'REMOTO';
}

export interface ScheduleCycleAssignmentInput {
  employeeId: number;
  date: string;
  legendCode: string;
  modality?: 'PRESENCIAL' | 'REMOTO';
}

export interface ReplaceScheduleCycleAssignmentsInput {
  assignments: ScheduleCycleAssignmentInput[];
}

export interface ScheduleCycleCounter {
  employeeId: number;
  employeeName: string;
  workedDays: number;
  restDays: number;
  absenceDays: number;
  neutralDays: number;
  plannedMinutes: number;
}
