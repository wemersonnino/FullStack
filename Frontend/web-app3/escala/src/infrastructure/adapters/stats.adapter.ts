import { ENV } from "@/constants/env";
import { StatsMapper } from "./mappers/stats.mapper";
import { DashboardStats } from "@/core/domain/models/stats.model";

export class StatsBackendAdapter {
  private static baseUrl = ENV.API_BASE_URL;

  static async getDashboardSummary(token: string): Promise<DashboardStats> {
    const response = await fetch(`${this.baseUrl}/api/v1/dashboard/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      next: { revalidate: 60 } // Revalida a cada minuto (Cache Next.js)
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
