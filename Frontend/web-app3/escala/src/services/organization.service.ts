import { API_ROUTES } from '@/constants/api';
import { httpDelete, httpGet, httpPatch, httpPost } from '@/lib/http/request';

export type Sector = {
  id: number;
  name: string;
  description?: string;
  maxSeats?: number | null;
};

export type Project = {
  id: number;
  name: string;
  description?: string;
  active: boolean;
};

export type OrganizationPayload = {
  name: string;
  description?: string;
  maxSeats?: number | null;
  active?: boolean;
};

export async function getSectors(authToken?: string) {
  return (await httpGet<Sector[]>(API_ROUTES.SECTORS, undefined, { authToken })) ?? [];
}

export async function createSector(payload: OrganizationPayload) {
  return httpPost<Sector>(API_ROUTES.SECTORS, payload);
}

export async function updateSector(id: number, payload: Partial<OrganizationPayload>) {
  return httpPatch<Sector>(`${API_ROUTES.SECTORS}/${id}`, payload);
}

export async function deleteSector(id: number) {
  return httpDelete(`${API_ROUTES.SECTORS}/${id}`);
}

export async function getProjects(authToken?: string) {
  return (await httpGet<Project[]>(API_ROUTES.PROJECTS, undefined, { authToken })) ?? [];
}

export async function createProject(payload: OrganizationPayload) {
  return httpPost<Project>(API_ROUTES.PROJECTS, payload);
}

export async function updateProject(id: number, payload: Partial<OrganizationPayload>) {
  return httpPatch<Project>(`${API_ROUTES.PROJECTS}/${id}`, payload);
}

export async function deleteProject(id: number) {
  return httpDelete(`${API_ROUTES.PROJECTS}/${id}`);
}
