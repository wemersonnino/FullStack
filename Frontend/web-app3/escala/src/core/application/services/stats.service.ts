import { DashboardStats } from "@/core/domain/models/stats.model";
import { StatsBackendAdapter } from "@/infrastructure/adapters/stats.adapter";

export class StatsService {
  static async getSummary(token: string): Promise<DashboardStats> {
    return await StatsBackendAdapter.getDashboardSummary(token);
  }
}
