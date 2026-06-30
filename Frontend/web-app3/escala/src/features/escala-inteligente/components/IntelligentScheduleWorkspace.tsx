'use client';

import { startTransition, useMemo, useState } from 'react';
import { addMonths, endOfWeek, format, parseISO, startOfWeek, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Archive,
  CalendarDays,
  Copy,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Search,
  ShieldAlert,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  createSchedulingCycle,
  createSchedulingHoliday,
  acknowledgeSchedulingAlert,
  archiveSchedulingCycle,
  publishSchedulingCycle,
  replaceSchedulingCycleAssignments,
  rectifySchedulingCycle,
  validateSchedulingCycle,
} from '@/services/intelligent-scheduling.service';
import {
  MonthCalendar,
  ReplaceScheduleCycleAssignmentsInput,
  ScheduleCycle,
  ScheduleCycleAssignment,
  ScheduleCycleCounter,
  ScheduleHoliday,
  ScheduleHolidayType,
  ScheduleLegend,
  ScheduleValidationAlert,
} from '@/core/domain/models/schedule.model';
import { UsuarioEscala } from '@/core/domain/escala/escala.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Props = {
  year: number;
  month: number;
  timezone: string;
  cycleId?: string;
  monthCalendar: MonthCalendar | null;
  legends: ScheduleLegend[];
  holidays: ScheduleHoliday[];
  cycle: ScheduleCycle | null;
  assignments: ScheduleCycleAssignment[];
  counters: ScheduleCycleCounter[];
  alerts: ScheduleValidationAlert[];
  usuarios: UsuarioEscala[];
  cycleLoadFailed: boolean;
};

const HOLIDAY_TYPES: { value: ScheduleHolidayType; label: string }[] = [
  { value: 'NATIONAL', label: 'Nacional' },
  { value: 'STATE', label: 'Estadual' },
  { value: 'MUNICIPAL', label: 'Municipal' },
  { value: 'CUSTOM', label: 'Customizado' },
];

const TEMPLATE_OPTIONS = [
  { value: '5x2', label: 'Template 5x2' },
  { value: '6x1', label: 'Template 6x1' },
  { value: '12x36', label: 'Template 12x36' },
] as const;

type ScheduleTemplate = (typeof TEMPLATE_OPTIONS)[number]['value'];

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${String(remainingMinutes).padStart(2, '0')}`;
}

function formatCycleStatus(status?: string) {
  return status ? status.replaceAll('_', ' ') : 'Sem ciclo';
}

function getAlertTone(severity: ScheduleValidationAlert['severity']) {
  if (severity === 'CRITICAL') return 'border-red-200 bg-red-50 text-red-900';
  if (severity === 'WARNING') return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-sky-200 bg-sky-50 text-sky-900';
}

function preferredLegendByImpact(legends: ScheduleLegend[], impact: ScheduleLegend['impact']) {
  const preferredCodes =
    impact === 'WORKED'
      ? ['TRAB', 'WORK', 'PRES', 'REM']
      : impact === 'REST'
        ? ['FOLGA', 'DESC', 'REST']
        : impact === 'ABSENCE'
          ? ['FERIAS', 'ATEST', 'AUS']
          : [];

  return (
    preferredCodes
      .map((code) => legends.find((legend) => legend.code.toUpperCase() === code))
      .find(Boolean) ||
    legends.find((legend) => legend.impact === impact) ||
    legends[0] ||
    null
  );
}

function assignmentKey(employeeId: string, date: string) {
  return `${employeeId}::${date}`;
}

type AssignmentDraft = {
  employeeId: string;
  employeeName: string;
  date: string;
  legendCode: string;
  modality: 'PRESENCIAL' | 'REMOTO';
};

type EditingCell = {
  employeeId: string;
  employeeName: string;
  date: string;
};

function buildAssignmentDraftMap(assignments: ScheduleCycleAssignment[]) {
  return assignments.reduce<Record<string, AssignmentDraft>>((accumulator, assignment) => {
    accumulator[assignmentKey(assignment.employeeId, assignment.date)] = {
      employeeId: assignment.employeeId,
      employeeName: assignment.employeeName,
      date: assignment.date,
      legendCode: assignment.legendCode,
      modality: assignment.modality,
    };
    return accumulator;
  }, {});
}

export function IntelligentScheduleWorkspace({
  year,
  month,
  timezone,
  cycleId,
  monthCalendar,
  legends,
  holidays,
  cycle,
  assignments,
  counters,
  alerts: initialAlerts,
  usuarios,
  cycleLoadFailed,
}: Props) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [holidayDate, setHolidayDate] = useState(`${year}-${String(month).padStart(2, '0')}-01`);
  const [holidayName, setHolidayName] = useState('');
  const [holidayType, setHolidayType] = useState<ScheduleHolidayType>('CUSTOM');
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [cellLegendCode, setCellLegendCode] = useState<string>('');
  const [cellModality, setCellModality] = useState<'PRESENCIAL' | 'REMOTO'>('PRESENCIAL');
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, AssignmentDraft>>(() =>
    buildAssignmentDraftMap(assignments)
  );
  const [copyFromEmployeeId, setCopyFromEmployeeId] = useState<string>('');
  const [copyToEmployeeId, setCopyToEmployeeId] = useState<string>('');
  const [templateEmployeeId, setTemplateEmployeeId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate>('5x2');

  const referenceDate = useMemo(() => new Date(year, month - 1, 1), [year, month]);
  const monthLabel = format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR });
  const editableCycleStatuses: ScheduleCycle['status'][] = ['RASCUNHO', 'EM_VALIDACAO', 'RETIFICADO'];
  const canEditAssignments = Boolean(cycleId && cycle && editableCycleStatuses.includes(cycle.status));

  const assignmentsByDate = useMemo(() => {
    return Object.values(assignmentDrafts).reduce<Record<string, AssignmentDraft[]>>((accumulator, assignment) => {
      const dateKey = assignment.date;
      if (!accumulator[dateKey]) {
        accumulator[dateKey] = [];
      }
      accumulator[dateKey].push(assignment);
      return accumulator;
    }, {});
  }, [assignmentDrafts]);

  const draftAssignmentsList = useMemo(
    () => Object.values(assignmentDrafts).sort((left, right) => left.date.localeCompare(right.date) || left.employeeName.localeCompare(right.employeeName)),
    [assignmentDrafts]
  );

  const filteredUsuarios = useMemo(() => {
    const normalizedQuery = employeeQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      return [usuario.nome, usuario.email, usuario.cargo, usuario.setorNome]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [employeeQuery, usuarios]);

  const initialAssignmentFingerprint = useMemo(
    () =>
      assignments
        .map((assignment) => `${assignment.employeeId}|${assignment.date}|${assignment.legendCode}|${assignment.modality}`)
        .sort()
        .join('||'),
    [assignments]
  );

  const draftAssignmentFingerprint = useMemo(
    () =>
      draftAssignmentsList
        .map((assignment) => `${assignment.employeeId}|${assignment.date}|${assignment.legendCode}|${assignment.modality}`)
        .sort()
        .join('||'),
    [draftAssignmentsList]
  );

  const hasPendingAssignmentChanges = initialAssignmentFingerprint !== draftAssignmentFingerprint;

  const holidayCountInMonth = monthCalendar?.days.filter((day) => day.holiday).length ?? 0;
  const workedLegend = preferredLegendByImpact(legends, 'WORKED');
  const restLegend = preferredLegendByImpact(legends, 'REST');
  const initialAssignmentsMap = useMemo(() => buildAssignmentDraftMap(assignments), [assignments]);
  const diffSummary = useMemo(() => {
    const changes: Array<{ key: string; type: 'added' | 'updated' | 'removed'; before?: AssignmentDraft; after?: AssignmentDraft }> = [];
    const allKeys = new Set([...Object.keys(initialAssignmentsMap), ...Object.keys(assignmentDrafts)]);

    allKeys.forEach((key) => {
      const before = initialAssignmentsMap[key];
      const after = assignmentDrafts[key];

      if (!before && after) {
        changes.push({ key, type: 'added', after });
        return;
      }

      if (before && !after) {
        changes.push({ key, type: 'removed', before });
        return;
      }

      if (
        before &&
        after &&
        (before.legendCode !== after.legendCode || before.modality !== after.modality)
      ) {
        changes.push({ key, type: 'updated', before, after });
      }
    });

    return {
      added: changes.filter((change) => change.type === 'added'),
      updated: changes.filter((change) => change.type === 'updated'),
      removed: changes.filter((change) => change.type === 'removed'),
      all: changes.sort((left, right) => {
        const leftDate = (left.after?.date ?? left.before?.date ?? '');
        const rightDate = (right.after?.date ?? right.before?.date ?? '');
        return leftDate.localeCompare(rightDate);
      }),
    };
  }, [assignmentDrafts, initialAssignmentsMap]);

  async function runAction(actionKey: string, action: () => Promise<void>) {
    setRunningAction(actionKey);
    try {
      await action();
    } finally {
      setRunningAction(null);
    }
  }

  function navigateToMonth(nextDate: Date) {
    const params = new URLSearchParams();
    params.set('year', String(nextDate.getFullYear()));
    params.set('month', String(nextDate.getMonth() + 1));
    params.set('timezone', timezone);
    startTransition(() => {
      router.push(`/dashboard/escala/inteligente?${params.toString()}`);
    });
  }

  function openCellEditor(employee: UsuarioEscala, date: string) {
    const currentAssignment = assignmentDrafts[assignmentKey(employee.id, date)];
    setEditingCell({
      employeeId: employee.id,
      employeeName: employee.nome,
      date,
    });
    setCellLegendCode(currentAssignment?.legendCode ?? legends[0]?.code ?? '');
    setCellModality(currentAssignment?.modality ?? 'PRESENCIAL');
  }

  function closeCellEditor() {
    setEditingCell(null);
    setCellLegendCode('');
    setCellModality('PRESENCIAL');
  }

  function saveCellAssignment() {
    if (!editingCell || !cellLegendCode) {
      toast.error('Selecione uma legenda para a atribuicao.');
      return;
    }

    setAssignmentDrafts((current) => ({
      ...current,
      [assignmentKey(editingCell.employeeId, editingCell.date)]: {
        employeeId: editingCell.employeeId,
        employeeName: editingCell.employeeName,
        date: editingCell.date,
        legendCode: cellLegendCode,
        modality: cellModality,
      },
    }));
    closeCellEditor();
  }

  function applyAssignmentToWholeWeek() {
    if (!editingCell || !cellLegendCode) {
      toast.error('Selecione uma legenda para preencher a semana.');
      return;
    }

    const weekStart = startOfWeek(parseISO(editingCell.date), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(parseISO(editingCell.date), { weekStartsOn: 1 });
    const weekDays = monthCalendar?.days.filter((day) => {
      const current = parseISO(day.date);
      return current >= weekStart && current <= weekEnd;
    }) ?? [];

    setAssignmentDrafts((current) => {
      const nextDrafts = { ...current };
      weekDays.forEach((day) => {
        nextDrafts[assignmentKey(editingCell.employeeId, day.date)] = {
          employeeId: editingCell.employeeId,
          employeeName: editingCell.employeeName,
          date: day.date,
          legendCode: cellLegendCode,
          modality: cellModality,
        };
      });
      return nextDrafts;
    });

    toast.success('Semana preenchida.');
    closeCellEditor();
  }

  function clearCellAssignment() {
    if (!editingCell) return;
    setAssignmentDrafts((current) => {
      const nextDrafts = { ...current };
      delete nextDrafts[assignmentKey(editingCell.employeeId, editingCell.date)];
      return nextDrafts;
    });
    closeCellEditor();
  }

  function handleCopyAssignmentsBetweenEmployees() {
    if (!copyFromEmployeeId || !copyToEmployeeId) {
      toast.error('Selecione origem e destino para copiar a escala.');
      return;
    }

    if (copyFromEmployeeId === copyToEmployeeId) {
      toast.error('Origem e destino precisam ser diferentes.');
      return;
    }

    const sourceEmployee = usuarios.find((usuario) => usuario.id === copyFromEmployeeId);
    const targetEmployee = usuarios.find((usuario) => usuario.id === copyToEmployeeId);

    if (!sourceEmployee || !targetEmployee) {
      toast.error('Nao foi possivel localizar os colaboradores selecionados.');
      return;
    }

    setAssignmentDrafts((current) => {
      const nextDrafts = { ...current };

      Object.keys(nextDrafts).forEach((key) => {
        if (key.startsWith(`${copyToEmployeeId}::`)) {
          delete nextDrafts[key];
        }
      });

      Object.values(current)
        .filter((draft) => draft.employeeId === copyFromEmployeeId)
        .forEach((draft) => {
          nextDrafts[assignmentKey(copyToEmployeeId, draft.date)] = {
            employeeId: copyToEmployeeId,
            employeeName: targetEmployee.nome,
            date: draft.date,
            legendCode: draft.legendCode,
            modality: draft.modality,
          };
        });

      return nextDrafts;
    });

    toast.success(`Escala mensal copiada de ${sourceEmployee.nome} para ${targetEmployee.nome}.`);
  }

  function handleApplyTemplate() {
    if (!templateEmployeeId) {
      toast.error('Selecione um colaborador para aplicar o template.');
      return;
    }

    if (!monthCalendar || !workedLegend || !restLegend) {
      toast.error('Legendas de trabalho e descanso precisam estar disponiveis.');
      return;
    }

    const targetEmployee = usuarios.find((usuario) => usuario.id === templateEmployeeId);
    if (!targetEmployee) {
      toast.error('Colaborador do template nao encontrado.');
      return;
    }

    setAssignmentDrafts((current) => {
      const nextDrafts = { ...current };

      Object.keys(nextDrafts).forEach((key) => {
        if (key.startsWith(`${templateEmployeeId}::`)) {
          delete nextDrafts[key];
        }
      });

      monthCalendar.days.forEach((day, index) => {
        const parsedDate = parseISO(day.date);
        const weekday = parsedDate.getDay();
        const isSunday = weekday === 0;
        const isSaturday = weekday === 6;

        let shouldWork = false;
        if (selectedTemplate === '5x2') {
          shouldWork = !day.holiday && !isSaturday && !isSunday;
        } else if (selectedTemplate === '6x1') {
          shouldWork = !day.holiday && !isSunday;
        } else if (selectedTemplate === '12x36') {
          shouldWork = !day.holiday && index % 2 === 0;
        }

        const legend = shouldWork ? workedLegend : restLegend;
        const modality = shouldWork && selectedTemplate === '5x2' ? 'PRESENCIAL' : shouldWork ? 'REMOTO' : 'PRESENCIAL';

        nextDrafts[assignmentKey(templateEmployeeId, day.date)] = {
          employeeId: templateEmployeeId,
          employeeName: targetEmployee.nome,
          date: day.date,
          legendCode: legend.code,
          modality,
        };
      });

      return nextDrafts;
    });

    toast.success(`Template ${selectedTemplate} aplicado para ${targetEmployee.nome}.`);
  }

  async function handleSaveAssignments() {
    if (!cycleId) return;

    const payload: ReplaceScheduleCycleAssignmentsInput = {
      assignments: draftAssignmentsList.map((assignment) => ({
        employeeId: assignment.employeeId,
        date: assignment.date,
        legendCode: assignment.legendCode,
        modality: assignment.modality,
      })),
    };

    await runAction('save-assignments', async () => {
      const saved = await replaceSchedulingCycleAssignments(cycleId, payload);
      if (!saved) {
        toast.error('Nao foi possivel salvar as atribuicoes do ciclo.');
        return;
      }

      toast.success('Atribuicoes atualizadas.');
      router.refresh();
    });
  }

  async function handleCreateCycle() {
    await runAction('create-cycle', async () => {
      const created = await createSchedulingCycle({ year, month, timezone });
      if (!created?.id) {
        toast.error('Nao foi possivel criar o ciclo mensal.');
        return;
      }

      toast.success('Ciclo mensal criado.');
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
        timezone,
        cycleId: created.id,
      });
      startTransition(() => {
        router.push(`/dashboard/escala/inteligente?${params.toString()}`);
      });
    });
  }

  async function handleValidateCycle() {
    if (!cycleId) return;
    await runAction('validate-cycle', async () => {
      const nextAlerts = await validateSchedulingCycle(cycleId);
      setAlerts(nextAlerts);
      toast.success('Validacao concluida.');
      router.refresh();
    });
  }

  async function handlePublishCycle() {
    if (!cycleId) return;
    await runAction('publish-cycle', async () => {
      const published = await publishSchedulingCycle(cycleId);
      if (!published) {
        toast.error('Nao foi possivel publicar o ciclo.');
        return;
      }
      toast.success('Ciclo publicado.');
      router.refresh();
    });
  }

  async function handleRectifyCycle() {
    if (!cycleId) return;
    await runAction('rectify-cycle', async () => {
      const rectified = await rectifySchedulingCycle(cycleId);
      if (!rectified) {
        toast.error('Nao foi possivel abrir a retificacao.');
        return;
      }
      toast.success('Retificacao iniciada.');
      router.refresh();
    });
  }

  async function handleArchiveCycle() {
    if (!cycleId) return;
    await runAction('archive-cycle', async () => {
      const archived = await archiveSchedulingCycle(cycleId);
      if (!archived) {
        toast.error('Nao foi possivel arquivar o ciclo.');
        return;
      }
      toast.success('Ciclo arquivado.');
      router.refresh();
    });
  }

  async function handleAcknowledgeAlert(alertId: string) {
    if (!cycleId) return;
    await runAction(`ack-${alertId}`, async () => {
      const response = await acknowledgeSchedulingAlert(cycleId, alertId);
      if (!response) {
        toast.error('Nao foi possivel registrar a ciencia do alerta.');
        return;
      }
      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId
            ? { ...alert, acknowledged: true, acknowledgedAt: response.acknowledgedAt }
            : alert
        )
      );
      toast.success('Ciencia registrada.');
    });
  }

  async function handleCreateHoliday() {
    if (!holidayDate || !holidayName.trim()) {
      toast.error('Informe data e nome do feriado.');
      return;
    }

    await runAction('create-holiday', async () => {
      const created = await createSchedulingHoliday({
        date: holidayDate,
        name: holidayName.trim(),
        type: holidayType,
      });

      if (!created) {
        toast.error('Nao foi possivel criar o feriado.');
        return;
      }

      toast.success('Feriado cadastrado.');
      setHolidayName('');
      router.refresh();
    });
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-slate-50 shadow-xl">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_60%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border border-sky-400/30 bg-sky-400/10 text-sky-100 hover:bg-sky-400/10">
              Escala Inteligente
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold capitalize">{monthLabel}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Monte o ciclo mensal com feriados, contadores, alertas criticos e publicacao auditavel.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-300">
              <span>Timezone: {timezone}</span>
              <span>Legendas ativas: {legends.length}</span>
              <span>Feriados no mes: {holidayCountInMonth}</span>
              {cycleId ? <span>Ciclo: {cycleId}</span> : <span>Nenhum ciclo selecionado</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigateToMonth(subMonths(referenceDate, 1))}
            >
              <ChevronLeft className="size-4" />
              Mes anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigateToMonth(addMonths(referenceDate, 1))}
            >
              Proximo mes
              <ChevronRight className="size-4" />
            </Button>
            <Button type="button" onClick={handleCreateCycle} disabled={runningAction === 'create-cycle'}>
              {runningAction === 'create-cycle' ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Criar ciclo
            </Button>
          </div>
        </div>
      </div>

      {cycleLoadFailed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          O ciclo informado nao foi carregado. A rota de produto existe, mas o backend ainda nao oferece listagem por mes para recuperar ciclos automaticamente.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status do ciclo</CardDescription>
            <CardTitle className="text-xl">{formatCycleStatus(cycle?.status)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {cycle ? `Versao de negocio ${cycle.businessVersion}` : 'Crie um ciclo para abrir validacao e publicacao.'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Atribuicoes</CardDescription>
            <CardTitle className="text-xl">{assignments.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Total de lancamentos do ciclo atual.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alertas</CardDescription>
            <CardTitle className="text-xl">{alerts.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {alerts.filter((alert) => !alert.acknowledged).length} pendentes de ciencia.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contadores</CardDescription>
            <CardTitle className="text-xl">{counters.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Colaboradores com consolidacao do mes.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-5" />
              Calendario mensal inteligente
            </CardTitle>
            <CardDescription>
              Panorama do mes com fins de semana, feriados aplicados e volume de atribuicoes por dia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthCalendar ? (
              <div className="grid grid-cols-7 gap-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((weekday) => (
                  <div key={weekday} className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {weekday}
                  </div>
                ))}
                {monthCalendar.days.map((day) => {
                  const dayDate = parseISO(day.date);
                  const dayAssignments = assignmentsByDate[day.date] ?? [];
                  return (
                    <div
                      key={day.date}
                      className={cn(
                        'min-h-28 rounded-2xl border p-3 shadow-sm',
                        day.weekend && 'bg-muted/35',
                        day.holiday && 'border-red-200 bg-red-50/70'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{format(dayDate, 'dd')}</p>
                          <p className="text-[11px] text-muted-foreground">{format(dayDate, 'EEE', { locale: ptBR })}</p>
                        </div>
                        {day.holiday && <Badge variant="destructive">Feriado</Badge>}
                      </div>
                      <div className="mt-3 space-y-2">
                        {day.holidayName && (
                          <p className="line-clamp-2 text-xs font-medium text-red-700">{day.holidayName}</p>
                        )}
                        <div className="flex items-center justify-between rounded-xl bg-muted/60 px-2 py-1 text-xs">
                          <span>Atribuicoes</span>
                          <strong>{dayAssignments.length}</strong>
                        </div>
                        {dayAssignments.slice(0, 2).map((assignment) => (
                          <div key={assignmentKey(assignment.employeeId, assignment.date)} className="rounded-xl border bg-background px-2 py-1 text-xs">
                            <p className="truncate font-medium">{assignment.employeeName}</p>
                            <p className="text-muted-foreground">
                              {assignment.legendCode} · {assignment.modality}
                            </p>
                          </div>
                        ))}
                        {dayAssignments.length > 2 && (
                          <p className="text-[11px] text-muted-foreground">+{dayAssignments.length - 2} outras atribuicoes</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                O calendario mensal ainda nao foi carregado.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ciclo mensal</CardTitle>
              <CardDescription>Fluxo operacional do rascunho ate o arquivamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status atual</span>
                  <Badge>{formatCycleStatus(cycle?.status)}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Versao</span>
                  <strong>{cycle?.businessVersion ?? '-'}</strong>
                </div>
              </div>
              <div className="grid gap-2">
                <Button type="button" variant="outline" onClick={handleValidateCycle} disabled={!cycleId || runningAction === 'validate-cycle'}>
                  {runningAction === 'validate-cycle' ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
                  Validar ciclo
                </Button>
                <Button type="button" variant="outline" onClick={handlePublishCycle} disabled={!cycleId || runningAction === 'publish-cycle'}>
                  {runningAction === 'publish-cycle' ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Publicar ciclo
                </Button>
                <Button type="button" variant="outline" onClick={handleRectifyCycle} disabled={!cycleId || runningAction === 'rectify-cycle'}>
                  {runningAction === 'rectify-cycle' ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
                  Abrir retificacao
                </Button>
                <Button type="button" variant="outline" onClick={handleArchiveCycle} disabled={!cycleId || runningAction === 'archive-cycle'}>
                  {runningAction === 'archive-cycle' ? <Loader2 className="size-4 animate-spin" /> : <Archive className="size-4" />}
                  Arquivar ciclo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legendas ativas</CardTitle>
              <CardDescription>Base semantica do calendario e dos contadores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {legends.map((legend) => (
                <div key={legend.code} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{legend.code}</p>
                    <p className="text-muted-foreground">{legend.label}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{legend.impact}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{formatMinutes(legend.plannedMinutes)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feriados do tenant</CardTitle>
              <CardDescription>Persistidos no backend e usados na validacao do mes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="holiday-date">Data</Label>
                  <Input id="holiday-date" type="date" value={holidayDate} onChange={(event) => setHolidayDate(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="holiday-name">Nome</Label>
                  <Input id="holiday-name" value={holidayName} onChange={(event) => setHolidayName(event.target.value)} placeholder="Ex.: Padroeiro da unidade" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="holiday-type">Tipo</Label>
                  <Select value={holidayType} onValueChange={(value) => setHolidayType(value as ScheduleHolidayType)}>
                    <SelectTrigger id="holiday-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOLIDAY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleCreateHoliday} disabled={runningAction === 'create-holiday'}>
                  {runningAction === 'create-holiday' ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Cadastrar feriado
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                {holidays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum feriado persistido para {year}.</p>
                ) : (
                  holidays.slice(0, 8).map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{holiday.name}</p>
                        <p className="text-muted-foreground">{format(parseISO(holiday.date), 'dd/MM/yyyy')}</p>
                      </div>
                      <Badge variant="outline">{holiday.type}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atribuicoes do ciclo</CardTitle>
            <CardDescription>
              Editor operacional mensal com persistencia bulk via ciclo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={employeeQuery}
                  onChange={(event) => setEmployeeQuery(event.target.value)}
                  placeholder="Filtrar colaborador, setor ou email"
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={hasPendingAssignmentChanges ? 'default' : 'secondary'}>
                  {hasPendingAssignmentChanges ? 'Alteracoes nao salvas' : 'Sem pendencias'}
                </Badge>
                <Button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={!canEditAssignments || !hasPendingAssignmentChanges || runningAction === 'save-assignments'}
                >
                  {runningAction === 'save-assignments' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Salvar atribuicoes
                </Button>
              </div>
            </div>
            <div className="mb-4 rounded-2xl border bg-muted/25 px-4 py-3 text-xs text-muted-foreground">
              Clique em uma celula da grade para definir legenda e modalidade. O backend substitui todas as atribuicoes do ciclo em cada salvamento.
            </div>
            <div className="mb-6 grid gap-4 xl:grid-cols-3">
              <Card className="border-dashed shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Copiar escala mensal</CardTitle>
                  <CardDescription>Replica o rascunho de um colaborador para outro no mes atual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={copyFromEmployeeId} onValueChange={setCopyFromEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={copyToEmployeeId} onValueChange={setCopyToEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={handleCopyAssignmentsBetweenEmployees} disabled={!canEditAssignments}>
                    <Copy className="size-4" />
                    Copiar mês
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Aplicar template</CardTitle>
                  <CardDescription>Preenche o mes com um padrão base de alocacao.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={templateEmployeeId} onValueChange={setTemplateEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as ScheduleTemplate)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_OPTIONS.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={handleApplyTemplate} disabled={!canEditAssignments}>
                    <Wand2 className="size-4" />
                    Aplicar template
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dif antes do save</CardTitle>
                  <CardDescription>Resumo do que o PATCH bulk vai alterar no ciclo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">+ {diffSummary.added.length} novas</Badge>
                    <Badge variant="secondary">~ {diffSummary.updated.length} alteradas</Badge>
                    <Badge variant="secondary">- {diffSummary.removed.length} removidas</Badge>
                  </div>
                  <div className="space-y-2">
                    {diffSummary.all.length === 0 ? (
                      <p className="text-muted-foreground">Nenhuma diferenca em relacao ao snapshot inicial.</p>
                    ) : (
                      diffSummary.all.slice(0, 5).map((change) => {
                        const before = change.before;
                        const after = change.after;
                        return (
                          <div key={change.key} className="rounded-xl border px-3 py-2">
                            <p className="font-medium">{after?.employeeName ?? before?.employeeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(after?.date ?? before?.date ?? `${year}-${String(month).padStart(2, '0')}-01`), 'dd/MM/yyyy')}
                            </p>
                            <p className="mt-1 text-xs">
                              {change.type === 'added' && `${after?.legendCode} · ${after?.modality}`}
                              {change.type === 'removed' && `Removido: ${before?.legendCode} · ${before?.modality}`}
                              {change.type === 'updated' &&
                                `${before?.legendCode}/${before?.modality} -> ${after?.legendCode}/${after?.modality}`}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="overflow-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 min-w-56 bg-background">Colaborador</TableHead>
                    {monthCalendar?.days.map((day) => (
                      <TableHead
                        key={day.date}
                        className={cn(
                          'min-w-24 text-center',
                          day.holiday && 'bg-red-50',
                          day.weekend && !day.holiday && 'bg-muted/40'
                        )}
                      >
                        <div className="flex flex-col">
                          <span>{format(parseISO(day.date), 'dd')}</span>
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {format(parseISO(day.date), 'EEE', { locale: ptBR })}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={(monthCalendar?.days.length ?? 0) + 1} className="py-10 text-center text-muted-foreground">
                        Nenhum colaborador encontrado para a grade.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="sticky left-0 z-10 min-w-56 bg-background align-top">
                          <div className="space-y-1">
                            <p className="font-medium">{usuario.nome}</p>
                            <p className="text-xs text-muted-foreground">{usuario.cargo || usuario.role}</p>
                            <p className="text-[11px] text-muted-foreground">{usuario.setorNome || usuario.email}</p>
                          </div>
                        </TableCell>
                        {monthCalendar?.days.map((day) => {
                          const draft = assignmentDrafts[assignmentKey(usuario.id, day.date)];
                          return (
                            <TableCell key={`${usuario.id}-${day.date}`} className="p-2 text-center">
                              <button
                                type="button"
                                disabled={!canEditAssignments}
                                onClick={() => openCellEditor(usuario, day.date)}
                                className={cn(
                                  'flex min-h-14 w-full flex-col items-center justify-center rounded-xl border px-2 py-1 text-xs transition-colors',
                                  canEditAssignments ? 'hover:border-primary hover:bg-primary/5' : 'cursor-not-allowed opacity-70',
                                  draft ? 'border-primary/30 bg-primary/10 text-primary' : 'border-dashed text-muted-foreground',
                                  day.holiday && !draft && 'border-red-200 bg-red-50 text-red-700',
                                  day.weekend && !day.holiday && !draft && 'bg-muted/30'
                                )}
                              >
                                {draft ? (
                                  <>
                                    <span className="font-semibold">{draft.legendCode}</span>
                                    <span className="text-[10px]">{draft.modality === 'REMOTO' ? 'Remoto' : 'Presencial'}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{day.holiday ? 'Feriado' : '+'}</span>
                                    <span className="text-[10px]">{day.holidayName ?? 'Definir'}</span>
                                  </>
                                )}
                              </button>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <Separator className="my-6" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Legenda</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead className="text-right">Min.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftAssignmentsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhuma atribuicao carregada para este ciclo.
                    </TableCell>
                  </TableRow>
                ) : (
                  draftAssignmentsList.map((assignment) => (
                    <TableRow key={assignmentKey(assignment.employeeId, assignment.date)}>
                      <TableCell>{format(parseISO(assignment.date), 'dd/MM')}</TableCell>
                      <TableCell>{assignment.employeeName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{assignment.legendCode}</span>
                          <span className="text-xs text-muted-foreground">
                            {legends.find((legend) => legend.code === assignment.legendCode)?.label ?? 'Legenda do ciclo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.modality}</TableCell>
                      <TableCell className="text-right">
                        {formatMinutes(legends.find((legend) => legend.code === assignment.legendCode)?.plannedMinutes ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contadores por colaborador</CardTitle>
            <CardDescription>Worked, rest, absence e minutos planejados do ciclo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Trab.</TableHead>
                  <TableHead>Desc.</TableHead>
                  <TableHead>Aus.</TableHead>
                  <TableHead className="text-right">Carga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Valide o ciclo para popular os contadores.
                    </TableCell>
                  </TableRow>
                ) : (
                  counters.map((counter) => (
                    <TableRow key={counter.employeeId}>
                      <TableCell>{counter.employeeName}</TableCell>
                      <TableCell>{counter.workedDays}</TableCell>
                      <TableCell>{counter.restDays}</TableCell>
                      <TableCell>{counter.absenceDays}</TableCell>
                      <TableCell className="text-right">{formatMinutes(counter.plannedMinutes)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Alertas de validacao
          </CardTitle>
          <CardDescription>Alertas criticos e warnings que precisam de ajuste ou ciencia explicita.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              Nenhum alerta encontrado. Rode a validacao do ciclo para obter a fila de analise.
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={cn('rounded-2xl border p-4', getAlertTone(alert.severity))}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{alert.severity}</Badge>
                      <Badge variant="outline">{alert.ruleCode}</Badge>
                      {alert.acknowledged && <Badge className="bg-emerald-600 text-white">Ciente</Badge>}
                    </div>
                    <p className="font-medium">{alert.message}</p>
                    <div className="flex flex-wrap gap-4 text-xs opacity-80">
                      {alert.employeeName ? <span>Colaborador: {alert.employeeName}</span> : null}
                      {alert.date ? <span>Data: {format(parseISO(alert.date), 'dd/MM/yyyy')}</span> : null}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white/60"
                    disabled={alert.acknowledged || runningAction === `ack-${alert.id}`}
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    {runningAction === `ack-${alert.id}` ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
                    Registrar ciencia
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingCell)} onOpenChange={(open) => !open && closeCellEditor()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar atribuicao</DialogTitle>
            <DialogDescription>
              {editingCell
                ? `${editingCell.employeeName} em ${format(parseISO(editingCell.date), "dd 'de' MMMM", { locale: ptBR })}`
                : 'Selecione uma celula da grade.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="assignment-legend">Legenda</Label>
              <Select value={cellLegendCode} onValueChange={setCellLegendCode}>
                <SelectTrigger id="assignment-legend">
                  <SelectValue placeholder="Selecione a legenda" />
                </SelectTrigger>
                <SelectContent>
                  {legends.map((legend) => (
                    <SelectItem key={legend.code} value={legend.code}>
                      {legend.code} · {legend.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignment-modality">Modalidade</Label>
              <Select value={cellModality} onValueChange={(value) => setCellModality(value as 'PRESENCIAL' | 'REMOTO')}>
                <SelectTrigger id="assignment-modality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="REMOTO">Remoto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={clearCellAssignment} disabled={!canEditAssignments}>
                <Eraser className="size-4" />
                Limpar
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={applyAssignmentToWholeWeek} disabled={!canEditAssignments}>
                  <CalendarDays className="size-4" />
                  Preencher semana
                </Button>
                <Button type="button" variant="outline" onClick={closeCellEditor}>
                  Cancelar
                </Button>
              <Button type="button" onClick={saveCellAssignment} disabled={!canEditAssignments}>
                <Save className="size-4" />
                Aplicar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
