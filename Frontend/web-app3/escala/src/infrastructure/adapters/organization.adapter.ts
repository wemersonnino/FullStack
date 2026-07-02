import { ENV } from "@/constants/env";
import { OrganizationMapper } from "./mappers/organization.mapper";
import { Sector, Project } from "@/core/domain/models/organization.model";

export class OrganizationBackendAdapter {
  private static baseUrl = '/api/bff/organization';
  private static backendBaseUrl = `${ENV.API_BASE_URL}/api/v1/organization`;

  private static url(path: string, token?: string) {
    if (typeof window === 'undefined' && token) {
      return `${this.backendBaseUrl}${path}`;
    }

    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  private static headers(token?: string, json = false): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (json) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private static extractCollection<T>(payload: T[] | { content?: T[] } | null | undefined): T[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
  }

  // Sectors
  static async listSectors(token?: string): Promise<Sector[]> {
    const response = await fetch(this.url('/sectors', token), {
      headers: this.headers(token),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error("Failed to fetch sectors");
    const dtos = this.extractCollection(await response.json());
    return dtos.map((dto: any) => OrganizationMapper.sectorToDomain(dto));
  }

  static async createSector(sector: Partial<Sector>, token?: string): Promise<Sector> {
    const response = await fetch(this.url('/sectors', token), {
      method: 'POST',
      headers: this.headers(token, true),
      body: JSON.stringify(OrganizationMapper.sectorToDto(sector)),
    });
    if (!response.ok) throw new Error("Failed to create sector");
    const dto = await response.json();
    return OrganizationMapper.sectorToDomain(dto);
  }

  static async updateSector(id: string, sector: Partial<Sector>, token?: string): Promise<Sector> {
    const response = await fetch(this.url(`/sectors/${id}`, token), {
      method: 'PUT',
      headers: this.headers(token, true),
      body: JSON.stringify(OrganizationMapper.sectorToDto(sector)),
    });
    if (!response.ok) throw new Error("Failed to update sector");
    const dto = await response.json();
    return OrganizationMapper.sectorToDomain(dto);
  }

  static async deleteSector(id: string, token?: string): Promise<void> {
    const response = await fetch(this.url(`/sectors/${id}`, token), {
      method: 'DELETE',
      headers: this.headers(token),
    });
    if (!response.ok) throw new Error("Failed to delete sector");
  }

  // Projects
  static async listProjects(token?: string): Promise<Project[]> {
    const response = await fetch(this.url('/projects', token), {
      headers: this.headers(token),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error("Failed to fetch projects");
    const dtos = this.extractCollection(await response.json());
    return dtos.map((dto: any) => OrganizationMapper.projectToDomain(dto));
  }

  static async createProject(project: Partial<Project>, token?: string): Promise<Project> {
    const response = await fetch(this.url('/projects', token), {
      method: 'POST',
      headers: this.headers(token, true),
      body: JSON.stringify(OrganizationMapper.projectToDto(project)),
    });
    if (!response.ok) throw new Error("Failed to create project");
    const dto = await response.json();
    return OrganizationMapper.projectToDomain(dto);
  }

  static async updateProject(id: string, project: Partial<Project>, token?: string): Promise<Project> {
    const response = await fetch(this.url(`/projects/${id}`, token), {
      method: 'PUT',
      headers: this.headers(token, true),
      body: JSON.stringify(OrganizationMapper.projectToDto(project)),
    });
    if (!response.ok) throw new Error("Failed to update project");
    const dto = await response.json();
    return OrganizationMapper.projectToDomain(dto);
  }

  static async deleteProject(id: string, token?: string): Promise<void> {
    const response = await fetch(this.url(`/projects/${id}`, token), {
      method: 'DELETE',
      headers: this.headers(token),
    });
    if (!response.ok) throw new Error("Failed to delete project");
  }
}
