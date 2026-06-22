import { httpGet, httpPost, httpDelete } from '@/lib/http/request';
import { API_ROUTES } from '@/constants/api';

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  avatarUrl?: string | null;
  position?: string;
  function?: string;
};

export async function getUsers(authToken?: string): Promise<UserResponse[]> {
  return (await httpGet<UserResponse[]>(API_ROUTES.USERS, undefined, { authToken })) ?? [];
}

export async function grantUserRole(userId: number, roleName: string): Promise<UserResponse | null> {
  return await httpPost<UserResponse>(`${API_ROUTES.USERS}/${userId}/roles`, { roleName });
}

export async function revokeUserRole(userId: number, roleName: string): Promise<UserResponse | null> {
  return await httpDelete<UserResponse>(`${API_ROUTES.USERS}/${userId}/roles`, { data: { roleName } });
}
