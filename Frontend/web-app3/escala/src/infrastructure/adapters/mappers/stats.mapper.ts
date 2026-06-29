import { DashboardStats } from "@/core/domain/models/stats.model";

export class StatsMapper {
  static toDomain(dto: any): DashboardStats {
    return {
      totalEmployees: Number(dto?.totalEmployees ?? dto?.activeEmployees ?? 0),
      openShifts: Number(dto?.openShifts ?? 0),
      pendingSwaps: Number(dto?.pendingSwaps ?? dto?.pendingSwapRequests ?? 0),
      activeProjects: Number(dto?.activeProjects ?? 0),
      attendanceRate: Number(dto?.attendanceRate ?? 0),
    };
  }
}
