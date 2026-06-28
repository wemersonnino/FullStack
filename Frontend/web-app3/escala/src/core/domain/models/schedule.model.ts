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
  id: string;
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
  publishedAt?: string | null;
  publishedBy?: string | null;
  archivedAt?: string | null;
  archivedBy?: string | null;
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
  employeeId: string;
  employeeName: string;
  date: string;
  legendCode: string;
  legendLabel: string;
  legendImpact: ScheduleLegendImpact;
  plannedMinutes: number;
  modality: 'PRESENCIAL' | 'REMOTO';
}

export interface ScheduleCycleAssignmentInput {
  employeeId: string;
  date: string;
  legendCode: string;
  modality?: 'PRESENCIAL' | 'REMOTO';
}

export interface ReplaceScheduleCycleAssignmentsInput {
  assignments: ScheduleCycleAssignmentInput[];
}

export interface ScheduleCycleCounter {
  employeeId: string;
  employeeName: string;
  workedDays: number;
  restDays: number;
  absenceDays: number;
  neutralDays: number;
  plannedMinutes: number;
}

export type ScheduleValidationSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface ScheduleValidationAlert {
  id: string;
  severity: ScheduleValidationSeverity;
  ruleCode: string;
  message: string;
  employeeId?: string | null;
  employeeName?: string | null;
  date?: string | null;
  acknowledged: boolean;
  acknowledgedAt?: string | null;
}

export interface AcknowledgeValidationAlertInput {
  reason?: string;
}

export interface ValidationAcknowledgement {
  id: string;
  alertId: string;
  ruleCode: string;
  severity: ScheduleValidationSeverity;
  acknowledgedBy: string;
  reason?: string | null;
  acknowledgedAt: string;
}
