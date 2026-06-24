export type AuditLog = {
  id: number;
  actor: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
};

export type AuditSummary = {
  eventsToday: number;
  totalEvents: number;
  integrityPercent: number;
  lastEventAt?: string | null;
};

export type AuditLogPage = {
  items: AuditLog[];
  summary: AuditSummary;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AuditLogFilters = {
  actor?: string;
  action?: string;
  entityType?: string;
  page?: number;
  size?: number;
};

export function canViewAuditLogs(roles: string[]) {
  return roles.includes('OWNER') || roles.includes('ADMIN');
}
