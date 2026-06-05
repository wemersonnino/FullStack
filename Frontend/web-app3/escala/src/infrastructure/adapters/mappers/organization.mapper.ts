import { Sector, Project } from "@/core/domain/models/organization.model";

export class OrganizationMapper {
  static sectorToDomain(dto: any): Sector {
    return {
      id: dto.id?.toString() || "",
      name: dto.name || "",
      description: dto.description,
      active: !!dto.active,
    };
  }

  static sectorToDto(domain: Partial<Sector>): any {
    return {
      name: domain.name,
      description: domain.description,
      active: domain.active,
    };
  }

  static projectToDomain(dto: any): Project {
    return {
      id: dto.id?.toString() || "",
      name: dto.name || "",
      description: dto.description,
      active: !!dto.active,
      sectorId: dto.sector?.id?.toString() || dto.sectorId?.toString(),
    };
  }

  static projectToDto(domain: Partial<Project>): any {
    return {
      name: domain.name,
      description: domain.description,
      active: domain.active,
      sectorId: domain.sectorId ? parseInt(domain.sectorId) : undefined,
    };
  }
}
