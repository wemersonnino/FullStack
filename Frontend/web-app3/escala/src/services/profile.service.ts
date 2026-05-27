// src/services/profile.service.ts
import { httpGet, httpPatch } from '@/lib/http/request';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { API_ROUTES } from '@/constants';
import { User } from 'next-auth';

export type UpdateMyProfilePayload = {
  username: string;
  email: string;
  theme?: ThemeEnum;
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

export async function changeMyPassword(payload: ChangeMyPasswordPayload): Promise<{ message: string } | null> {
  return await httpPatch<{ message: string }>(`${API_ROUTES.USERS}/me/password`, payload);
}

export async function updateUserTheme(userId: string | number, theme: ThemeEnum) {
  return await httpPatch(`${API_ROUTES.UPDATE_USER_THEME}/${userId}/theme`, { theme });
}
