// src/services/profile.service.ts
import { httpGet, httpPatch } from '@/lib/http/request';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { API_ROUTES } from '@/constants';
import { User } from 'next-auth';

export async function getMyProfile(): Promise<User | null> {
  const res = await httpGet<{ user: User }>('/api/users/me?populate=roles');
  return res?.user ?? null;
}

export async function updateUserTheme(theme: ThemeEnum) {
  return await httpPatch(API_ROUTES.UPDATE_USER_THEME, { theme });
}
