import { API_ROUTES } from '@/constants/api';
import { httpGet, httpPost } from '@/lib/http/request';

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
};

export async function getSectors(authToken?: string) {
  return (await httpGet<Sector[]>(API_ROUTES.SECTORS, undefined, { authToken })) ?? [];
}

export async function createSector(payload: OrganizationPayload) {
  return httpPost<Sector>(API_ROUTES.SECTORS, payload);
}

export async function getProjects(authToken?: string) {
  return (await httpGet<Project[]>(API_ROUTES.PROJECTS, undefined, { authToken })) ?? [];
}

export async function createProject(payload: OrganizationPayload) {
  return httpPost<Project>(API_ROUTES.PROJECTS, payload);
}
