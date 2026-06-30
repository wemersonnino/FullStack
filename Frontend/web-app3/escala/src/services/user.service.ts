import { httpGet, httpPost, httpDelete } from '@/lib/http/request';
import { API_ROUTES } from '@/constants/api';

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  avatarUrl?: string | null;
  position?: string;
  function?: string;
};

type PagedUserResponse = {
  content?: unknown;
};

function normalizeUsersResponse(payload: unknown): UserResponse[] {
  if (Array.isArray(payload)) {
    return payload as UserResponse[];
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as PagedUserResponse).content)) {
    return (payload as PagedUserResponse).content as UserResponse[];
  }

  return [];
}

export async function getUsers(authToken?: string): Promise<UserResponse[]> {
  const payload = await httpGet<UserResponse[] | PagedUserResponse>(API_ROUTES.USERS, undefined, { authToken });
  return normalizeUsersResponse(payload);
}

export async function grantUserRole(userId: string, roleName: string): Promise<UserResponse | null> {
  return await httpPost<UserResponse>(`${API_ROUTES.USERS}/${userId}/roles`, { roleName });
}

export async function revokeUserRole(userId: string, roleName: string): Promise<UserResponse | null> {
  return await httpDelete<UserResponse>(`${API_ROUTES.USERS}/${userId}/roles`, { data: { roleName } });
}
