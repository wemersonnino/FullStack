// src/services/profile.service.ts
import { httpGet, httpPatch } from '@/lib/http/request';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { API_ROUTES } from '@/constants';
import { User } from 'next-auth';

export type UpdateMyProfilePayload = {
  username: string;
  email: string;
  theme?: ThemeEnum;
  address?: string;
  position?: string;
  function?: string;
  avatar?: string | number | null;
};

export type ChangeMyPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function getMyProfile(): Promise<User | null> {
  return await httpGet<User>(`${API_ROUTES.USERS}/me`);
}

export async function updateMyProfile(payload: UpdateMyProfilePayload): Promise<User | null> {
  return await httpPatch<User>(`${API_ROUTES.USERS}/me`, payload);
}

export async function uploadFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('files', file);
  
  const response = await fetch('/api/bff/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) return null;
  return await response.json();
}

export async function changeMyPassword(payload: ChangeMyPasswordPayload): Promise<{ message: string } | null> {
  return await httpPatch<{ message: string }>(`${API_ROUTES.USERS}/me/password`, payload);
}

export async function updateUserTheme(userId: string | number, theme: ThemeEnum) {
  return await httpPatch(`${API_ROUTES.UPDATE_USER_THEME}/${userId}/theme`, { theme });
}
