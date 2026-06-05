import { ENV } from "@/constants/env";
import { OrganizationMapper } from "./mappers/organization.mapper";
import { Sector, Project } from "@/core/domain/models/organization.model";

export class OrganizationBackendAdapter {
  private static baseUrl = ENV.API_INTERNAL_URL;

  // Sectors
  static async listSectors(token: string): Promise<Sector[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/sectors`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch sectors");
    const dtos = await response.json();
    return dtos.map((dto: any) => OrganizationMapper.sectorToDomain(dto));
  }

  static async createSector(sector: Partial<Sector>, token: string): Promise<Sector> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/sectors`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(OrganizationMapper.sectorToDto(sector)),
    });
    if (!response.ok) throw new Error("Failed to create sector");
    const dto = await response.json();
    return OrganizationMapper.sectorToDomain(dto);
  }

  static async updateSector(id: string, sector: Partial<Sector>, token: string): Promise<Sector> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/sectors/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(OrganizationMapper.sectorToDto(sector)),
    });
    if (!response.ok) throw new Error("Failed to update sector");
    const dto = await response.json();
    return OrganizationMapper.sectorToDomain(dto);
  }

  static async deleteSector(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/sectors/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete sector");
  }

  // Projects
  static async listProjects(token: string): Promise<Project[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch projects");
    const dtos = await response.json();
    return dtos.map((dto: any) => OrganizationMapper.projectToDomain(dto));
  }

  static async createProject(project: Partial<Project>, token: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/projects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(OrganizationMapper.projectToDto(project)),
    });
    if (!response.ok) throw new Error("Failed to create project");
    const dto = await response.json();
    return OrganizationMapper.projectToDomain(dto);
  }

  static async updateProject(id: string, project: Partial<Project>, token: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/projects/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(OrganizationMapper.projectToDto(project)),
    });
    if (!response.ok) throw new Error("Failed to update project");
    const dto = await response.json();
    return OrganizationMapper.projectToDomain(dto);
  }

  static async deleteProject(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/organization/projects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete project");
  }
}
