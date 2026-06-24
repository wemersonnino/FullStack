import { AuditLogFilters, canViewAuditLogs } from '@/core/domain/models/audit-log.model';
import { AuditLogBackendAdapter } from '@/infrastructure/adapters/audit-log.adapter';

export class AuditLogService {
  static canView(roles: string[]) {
    return canViewAuditLogs(roles);
  }

  static search(token: string, filters: AuditLogFilters) {
    return AuditLogBackendAdapter.search(token, filters);
  }
}
