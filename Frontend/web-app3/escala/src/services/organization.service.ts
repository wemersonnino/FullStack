import { API_ROUTES } from '@/constants/api';
import { httpDelete, httpGet, httpPatch, httpPost } from '@/lib/http/request';

export type Sector = {
  id: string;
  name: string;
  description?: string;
  maxSeats?: number | null;
  managerId?: string | null;
  managerName?: string | null;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
};

export type OrganizationPayload = {
  name: string;
  description?: string;
  maxSeats?: number | null;
  managerId?: string | null;
  active?: boolean;
};

export async function getSectors(authToken?: string) {
  return (await httpGet<Sector[]>(API_ROUTES.SECTORS, undefined, { authToken })) ?? [];
}

export async function createSector(payload: OrganizationPayload) {
  return httpPost<Sector>(API_ROUTES.SECTORS, payload);
}

export async function updateSector(id: string, payload: Partial<OrganizationPayload>) {
  return httpPatch<Sector>(`${API_ROUTES.SECTORS}/${id}`, payload);
}

export async function deleteSector(id: string) {
  return httpDelete(`${API_ROUTES.SECTORS}/${id}`);
}

export async function getProjects(authToken?: string) {
  return (await httpGet<Project[]>(API_ROUTES.PROJECTS, undefined, { authToken })) ?? [];
}

export async function createProject(payload: OrganizationPayload) {
  return httpPost<Project>(API_ROUTES.PROJECTS, payload);
}

export async function updateProject(id: string, payload: Partial<OrganizationPayload>) {
  return httpPatch<Project>(`${API_ROUTES.PROJECTS}/${id}`, payload);
}

export async function deleteProject(id: string) {
  return httpDelete(`${API_ROUTES.PROJECTS}/${id}`);
}
