import { Employee } from "@/core/domain/models/employee.model";

export class EmployeeMapper {
  static toDomain(dto: any): Employee {
    return {
      id: dto.id?.toString() || "",
      fullName: dto.fullName || "",
      email: dto.email || "",
      active: !!dto.active,
      sector: dto.sector ? {
        id: dto.sector.id?.toString() || "",
        name: dto.sector.name || "",
      } : undefined,
      project: dto.project ? {
        id: dto.project.id?.toString() || "",
        name: dto.project.name || "",
      } : undefined,
      user: dto.user ? {
        id: dto.user.id?.toString() || "",
        username: dto.user.username || "",
        email: dto.user.email || "",
      } : undefined,
    };
  }

  static toDto(domain: Partial<Employee>): any {
    return {
      fullName: domain.fullName,
      email: domain.email,
      active: domain.active,
      sectorId: domain.sector?.id || undefined,
      projectId: domain.project?.id || undefined,
    };
  }
}
