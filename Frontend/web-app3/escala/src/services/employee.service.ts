import { API_ROUTES } from '@/constants/api';
import { httpDelete, httpGet, httpPost, httpPut } from '@/lib/http/request';

export type Employee = {
  id: number;
  fullName: string;
  email: string;
  active: boolean;
  sector?: { id: number; name: string };
  project?: { id: number; name: string };
  user?: { id: number; username: string; email: string };
};

export type EmployeePayload = {
  fullName: string;
  email: string;
  active?: boolean;
  sectorId?: number;
  projectId?: number;
};

export async function getEmployees(authToken?: string) {
  return (await httpGet<Employee[]>(API_ROUTES.EMPLOYEES, undefined, { authToken })) ?? [];
}

export async function createEmployee(payload: EmployeePayload) {
  return httpPost<Employee>(API_ROUTES.EMPLOYEES, payload);
}

export async function updateEmployee(id: number, payload: EmployeePayload) {
  return httpPut<Employee>(`${API_ROUTES.EMPLOYEES}/${id}`, payload);
}

export async function removeEmployee(id: number) {
  return httpDelete<void>(`${API_ROUTES.EMPLOYEES}/${id}`);
}
