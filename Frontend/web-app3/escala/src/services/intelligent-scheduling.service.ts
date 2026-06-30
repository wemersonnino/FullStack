import {
  AcknowledgeValidationAlertInput,
  CreateScheduleCycleInput,
  CreateScheduleHolidayInput,
  MonthCalendar,
  ReplaceScheduleCycleAssignmentsInput,
  ScheduleCycle,
  ScheduleCycleAssignment,
  ScheduleCycleCounter,
  ScheduleHoliday,
  ScheduleLegend,
  ScheduleValidationAlert,
  ValidationAcknowledgement,
} from '@/core/domain/models/schedule.model';
import { API_ROUTES } from '@/constants/api';
import { httpGet, httpPatch, httpPost } from '@/lib/http/request';

function cycleBasePath(cycleId: string) {
  return `${API_ROUTES.SCHEDULING_CYCLES}/${cycleId}`;
}

export async function getSchedulingMonthCalendar(
  params: { year: number; month: number; unitId?: string; timezone?: string },
  authToken?: string
): Promise<MonthCalendar | null> {
  return httpGet<MonthCalendar>(API_ROUTES.SCHEDULING_MONTH_CALENDAR, params, authToken ? { authToken } : undefined);
}

export async function getSchedulingLegends(authToken?: string): Promise<ScheduleLegend[]> {
  return (await httpGet<ScheduleLegend[]>(API_ROUTES.SCHEDULING_LEGENDS, undefined, authToken ? { authToken } : undefined)) ?? [];
}

export async function getSchedulingHolidays(
  params: { year: number; unitId?: string },
  authToken?: string
): Promise<ScheduleHoliday[]> {
  return (await httpGet<ScheduleHoliday[]>(API_ROUTES.SCHEDULING_HOLIDAYS, params, authToken ? { authToken } : undefined)) ?? [];
}

export async function createSchedulingHoliday(
  input: CreateScheduleHolidayInput,
  authToken?: string
): Promise<ScheduleHoliday | null> {
  return httpPost<ScheduleHoliday>(
    API_ROUTES.SCHEDULING_HOLIDAYS,
    input,
    authToken ? { authToken, throwOnError: true } : { throwOnError: true }
  );
}

export async function createSchedulingCycle(
  input: CreateScheduleCycleInput,
  authToken?: string
): Promise<ScheduleCycle | null> {
  return httpPost<ScheduleCycle>(
    API_ROUTES.SCHEDULING_CYCLES,
    input,
    authToken ? { authToken, throwOnError: true } : { throwOnError: true }
  );
}

export async function getSchedulingCycle(cycleId: string, authToken?: string): Promise<ScheduleCycle | null> {
  return httpGet<ScheduleCycle>(cycleBasePath(cycleId), undefined, authToken ? { authToken } : undefined);
}

export async function getSchedulingCycleAssignments(
  cycleId: string,
  authToken?: string
): Promise<ScheduleCycleAssignment[]> {
  return (
    (await httpGet<ScheduleCycleAssignment[]>(
      `${cycleBasePath(cycleId)}/assignments`,
      undefined,
      authToken ? { authToken } : undefined
    )) ?? []
  );
}

export async function replaceSchedulingCycleAssignments(
  cycleId: string,
  assignments: ReplaceScheduleCycleAssignmentsInput,
  authToken?: string
): Promise<ScheduleCycleAssignment[] | null> {
  return httpPatch<ScheduleCycleAssignment[]>(
    `${cycleBasePath(cycleId)}/assignments`,
    assignments,
    authToken ? { authToken, throwOnError: true } : { throwOnError: true }
  );
}

export async function getSchedulingCycleCounters(
  cycleId: string,
  authToken?: string
): Promise<ScheduleCycleCounter[]> {
  return (
    (await httpGet<ScheduleCycleCounter[]>(
      `${cycleBasePath(cycleId)}/counters`,
      undefined,
      authToken ? { authToken } : undefined
    )) ?? []
  );
}

export async function validateSchedulingCycle(
  cycleId: string,
  authToken?: string
): Promise<ScheduleValidationAlert[]> {
  return (
    (await httpPost<ScheduleValidationAlert[]>(
      `${cycleBasePath(cycleId)}/validate`,
      {},
      authToken ? { authToken, throwOnError: true } : { throwOnError: true }
    )) ?? []
  );
}

export async function getSchedulingCycleAlerts(
  cycleId: string,
  authToken?: string
): Promise<ScheduleValidationAlert[]> {
  return (
    (await httpGet<ScheduleValidationAlert[]>(
      `${cycleBasePath(cycleId)}/alerts`,
      undefined,
      authToken ? { authToken } : undefined
    )) ?? []
  );
}

export async function acknowledgeSchedulingAlert(
  cycleId: string,
  alertId: string,
  input: AcknowledgeValidationAlertInput = {},
  authToken?: string
): Promise<ValidationAcknowledgement | null> {
  return httpPost<ValidationAcknowledgement>(
    `${cycleBasePath(cycleId)}/alerts/${alertId}/acknowledge`,
    input,
    authToken ? { authToken, throwOnError: true } : { throwOnError: true }
  );
}

export async function publishSchedulingCycle(cycleId: string, authToken?: string): Promise<ScheduleCycle | null> {
  return httpPost<ScheduleCycle>(
    `${cycleBasePath(cycleId)}/publish`,
    {},
    authToken ? { authToken, throwOnError: true } : { throwOnError: true }
  );
}

export async function rectifySchedulingCycle(cycleId: string, authToken?: string): Promise<ScheduleCycle | null> {
  return httpPost<ScheduleCycle>(
    `${cycleBasePath(cycleId)}/rectify`,
    {},
    authToken ? { authToken, throwOnError: true } : { throwOnError: true }
  );
}

export async function archiveSchedulingCycle(cycleId: string, authToken?: string): Promise<ScheduleCycle | null> {
  return httpPost<ScheduleCycle>(
    `${cycleBasePath(cycleId)}/archive`,
    {},
    authToken ? { authToken, throwOnError: true } : { throwOnError: true }
  );
}
