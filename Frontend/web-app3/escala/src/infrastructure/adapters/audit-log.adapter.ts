import { AuditLogFilters, AuditLogPage } from '@/core/domain/models/audit-log.model';

export class AuditLogBackendAdapter {
  private static baseUrl = '/api/bff/audit-logs';

  private static url(filters: AuditLogFilters = {}) {
    const path = new URLSearchParams();
    if (filters.actor) path.set('actor', filters.actor);
    if (filters.action) path.set('action', filters.action);
    if (filters.entityType) path.set('entityType', filters.entityType);
    if (filters.page !== undefined) path.set('page', String(filters.page));
    if (filters.size !== undefined) path.set('size', String(filters.size));

    const suffix = path.toString() ? `?${path.toString()}` : '';
    const url = `${this.baseUrl}${suffix}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  static async search(token: string, filters: AuditLogFilters = {}): Promise<AuditLogPage> {
    const response = await fetch(this.url(filters), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Falha ao consultar logs de auditoria');
    }

    return response.json();
  }
}
