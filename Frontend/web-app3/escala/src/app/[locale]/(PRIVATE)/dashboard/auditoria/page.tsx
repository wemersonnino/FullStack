import { redirect } from 'next/navigation';
import { AuditLogService } from '@/core/application/services/audit-log.service';
import { AuditLogFilters, AuditLogPage } from '@/core/domain/models/audit-log.model';
import { AuditLogView } from '@/features/audit/components/AuditLogView';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

type AuditoriaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const EMPTY_AUDIT_PAGE: AuditLogPage = {
  items: [],
  summary: {
    eventsToday: 0,
    totalEvents: 0,
    integrityPercent: 100,
    lastEventAt: null,
  },
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function AuditoriaPage({ searchParams }: AuditoriaPageProps) {
  const { session, accessToken } = await getRequiredServerAuth();

  const roles = session.user.roles ?? [];
  if (!AuditLogService.canView(roles)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const filters: AuditLogFilters = {
    actor: first(params.actor) || undefined,
    action: first(params.action) || undefined,
    entityType: first(params.entityType) || undefined,
    page: toInt(first(params.page), 0),
    size: toInt(first(params.size), 20),
  };

  let data = EMPTY_AUDIT_PAGE;
  try {
    data = await AuditLogService.search(accessToken, filters);
  } catch {
    data = EMPTY_AUDIT_PAGE;
  }

  return <AuditLogView data={data} filters={filters} />;
}
