import { redirect } from 'next/navigation';
import { getUsuariosEscala } from '@/core/adapters/escala.service';
import { IntelligentScheduleWorkspace } from '@/features/escala-inteligente/components/IntelligentScheduleWorkspace';
import {
  ScheduleCycle,
  ScheduleCycleAssignment,
  ScheduleCycleCounter,
  ScheduleValidationAlert,
} from '@/core/domain/models/schedule.model';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import {
  getSchedulingCycle,
  getSchedulingCycleAlerts,
  getSchedulingCycleAssignments,
  getSchedulingCycleCounters,
  getSchedulingHolidays,
  getSchedulingLegends,
  getSchedulingMonthCalendar,
} from '@/services/intelligent-scheduling.service';

type IntelligentSchedulePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function IntelligentSchedulePage({ searchParams }: IntelligentSchedulePageProps) {
  const { session, accessToken } = await getRequiredServerAuth();
  const roles = session.user.roles ?? [];
  const canManageIntelligentSchedule =
    roles.includes('ADMIN') || roles.includes('OWNER') || roles.some((role) => role.startsWith('MANAGER'));

  if (!canManageIntelligentSchedule) {
    redirect('/dashboard/escala');
  }

  const params = await searchParams;
  const now = new Date();
  const year = parsePositiveNumber(firstValue(params?.year), now.getFullYear());
  const month = parsePositiveNumber(firstValue(params?.month), now.getMonth() + 1);
  const timezone = firstValue(params?.timezone) || 'America/Sao_Paulo';
  const cycleId = firstValue(params?.cycleId);

  const [monthCalendar, legends, holidays, usuarios] = await Promise.all([
    getSchedulingMonthCalendar({ year, month, timezone }, accessToken),
    getSchedulingLegends(accessToken),
    getSchedulingHolidays({ year }, accessToken),
    getUsuariosEscala(undefined, { authToken: accessToken }),
  ]);

  let cycle: ScheduleCycle | null = null;
  let assignments: ScheduleCycleAssignment[] = [];
  let counters: ScheduleCycleCounter[] = [];
  let alerts: ScheduleValidationAlert[] = [];
  let cycleLoadFailed = false;

  if (cycleId) {
    try {
      const loadedCycle = await getSchedulingCycle(cycleId, accessToken);
      if (!loadedCycle) {
        cycleLoadFailed = true;
      } else {
        cycle = loadedCycle;
        [assignments, counters, alerts] = await Promise.all([
          getSchedulingCycleAssignments(cycleId, accessToken),
          getSchedulingCycleCounters(cycleId, accessToken),
          getSchedulingCycleAlerts(cycleId, accessToken),
        ]);
      }
    } catch {
      cycleLoadFailed = true;
    }
  }

  const workspaceKey = [
    year,
    month,
    timezone,
    cycle?.id ?? cycleId ?? 'no-cycle',
    cycle?.updatedAt ?? 'no-update',
    assignments.map((assignment) => `${assignment.employeeId}:${assignment.date}:${assignment.legendCode}:${assignment.modality}`).join('|'),
  ].join('::');

  return (
    <IntelligentScheduleWorkspace
      key={workspaceKey}
      year={year}
      month={month}
      timezone={timezone}
      cycleId={cycleId}
      monthCalendar={monthCalendar}
      legends={legends}
      holidays={holidays}
      cycle={cycle}
      assignments={assignments}
      counters={counters}
      alerts={alerts}
      usuarios={usuarios}
      cycleLoadFailed={cycleLoadFailed}
    />
  );
}
