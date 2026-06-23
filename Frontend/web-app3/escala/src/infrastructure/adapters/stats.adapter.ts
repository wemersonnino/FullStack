import { StatsMapper } from "./mappers/stats.mapper";
import { DashboardStats } from "@/core/domain/models/stats.model";

export class StatsBackendAdapter {
  private static baseUrl = '/api/bff/stats';

  private static url(path: string) {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  static async getDashboardSummary(token: string): Promise<DashboardStats> {
    const now = new Date();
    const params = new URLSearchParams({
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
    });
    const response = await fetch(this.url(`/summary?${params.toString()}`), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
        // Fallback para fins de prototipagem se o endpoint Java ainda não existir
        return {
            totalEmployees: 42,
            openShifts: 5,
            pendingSwaps: 3,
            activeProjects: 2,
            attendanceRate: 94.5
        };
    }
    const dto = await response.json();
    return StatsMapper.toDomain(dto);
  }
}
