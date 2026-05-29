import { DashboardStats } from "@/core/domain/models/stats.model";

export class StatsMapper {
  static toDomain(dto: any): DashboardStats {
    return {
      totalEmployees: dto.totalEmployees || 0,
      openShifts: dto.openShifts || 0,
      pendingSwaps: dto.pendingSwaps || 0,
      activeProjects: dto.activeProjects || 0,
      attendanceRate: dto.attendanceRate || 0,
    };
  }
}
