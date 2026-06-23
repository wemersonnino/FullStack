// src/services/profile.service.ts
import { httpGet, httpPatch } from '@/lib/http/request';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { API_ROUTES, ENV } from '@/constants';
import { User } from 'next-auth';

export type UpdateMyProfilePayload = {
  username: string;
  email: string;
  theme?: ThemeEnum;
  address?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  position?: string;
  function?: string;
  avatarUrl?: string | null;
};

export type ChangeMyPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function getMyProfile(token?: string): Promise<User | null> {
  return await httpGet<User>(`${API_ROUTES.USERS}/me`, undefined, token ? { authToken: token } : undefined);
}

import { UserProfile } from '@/core/domain/models/user.model';

export async function updateMyProfile(payload: Partial<UpdateMyProfilePayload>): Promise<UserProfile | null> {
  return await httpPatch<UserProfile>(`${API_ROUTES.USERS}/me`, payload);
}

export type UploadedFile = {
  id?: number;
  url?: string;
};

export async function uploadAvatar(file: File): Promise<UploadedFile | null> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/bff/avatar/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data?.url ? { url: data.url } : null;
}

export async function uploadFile(file: File): Promise<UploadedFile[] | null> {
  const formData = new FormData();
  formData.append('files', file);
  
  const response = await fetch('/api/bff/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data)) return null;

  return data.map((item) => ({
    ...item,
    url: item.url?.startsWith('/') ? `${ENV.STRAPI_PUBLIC_URL}${item.url}` : item.url,
  }));
}

export async function changeMyPassword(payload: ChangeMyPasswordPayload): Promise<{ message: string } | null> {
  return await httpPatch<{ message: string }>(`${API_ROUTES.USERS}/me/password`, payload);
}

export async function updateUserTheme(userId: string | number, theme: ThemeEnum) {
  return await httpPatch(`${API_ROUTES.UPDATE_USER_THEME}/${userId}/theme`, { theme });
}
