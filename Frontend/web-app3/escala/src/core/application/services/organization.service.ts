import { Sector, Project } from "@/core/domain/models/organization.model";
import { OrganizationBackendAdapter } from "@/infrastructure/adapters/organization.adapter";

export class OrganizationService {
  // Sectors
  static async listSectors(token?: string): Promise<Sector[]> {
    return await OrganizationBackendAdapter.listSectors(token);
  }

  static async createSector(sector: Partial<Sector>, token?: string): Promise<Sector> {
    return await OrganizationBackendAdapter.createSector(sector, token);
  }

  static async updateSector(id: string, sector: Partial<Sector>, token?: string): Promise<Sector> {
    return await OrganizationBackendAdapter.updateSector(id, sector, token);
  }

  static async deleteSector(id: string, token?: string): Promise<void> {
    return await OrganizationBackendAdapter.deleteSector(id, token);
  }

  // Projects
  static async listProjects(token?: string): Promise<Project[]> {
    return await OrganizationBackendAdapter.listProjects(token);
  }

  static async createProject(project: Partial<Project>, token?: string): Promise<Project> {
    return await OrganizationBackendAdapter.createProject(project, token);
  }

  static async updateProject(id: string, project: Partial<Project>, token?: string): Promise<Project> {
    return await OrganizationBackendAdapter.updateProject(id, project, token);
  }

  static async deleteProject(id: string, token?: string): Promise<void> {
    return await OrganizationBackendAdapter.deleteProject(id, token);
  }
}
