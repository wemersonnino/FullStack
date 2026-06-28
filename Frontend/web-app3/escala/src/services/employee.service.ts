import { API_ROUTES } from '@/constants/api';
import { httpDelete, httpGet, httpPost, httpPut } from '@/lib/http/request';

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  sector?: { id: string; name: string };
  project?: { id: string; name: string };
  user?: { id: string; username: string; email: string };
};

export type EmployeePayload = {
  fullName: string;
  email: string;
  active?: boolean;
  sectorId?: string;
  projectId?: string;
};

export async function getEmployees(authToken?: string) {
  return (await httpGet<Employee[]>(API_ROUTES.EMPLOYEES, undefined, { authToken })) ?? [];
}

export async function createEmployee(payload: EmployeePayload) {
  return httpPost<Employee>(API_ROUTES.EMPLOYEES, payload);
}

export async function updateEmployee(id: string, payload: EmployeePayload) {
  return httpPut<Employee>(`${API_ROUTES.EMPLOYEES}/${id}`, payload);
}

export async function removeEmployee(id: string) {
  return httpDelete<void>(`${API_ROUTES.EMPLOYEES}/${id}`);
}
