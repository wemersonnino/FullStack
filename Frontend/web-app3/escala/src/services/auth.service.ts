import { API_ROUTES } from '@/constants/api';
import { httpPost } from '@/lib/http/request';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';

export type BackendAuthUser = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  theme: ThemeEnum;
  companyId?: string;
  companySlug?: string;
  companyName?: string;
  companyTheme?: string;
};

export type BackendAuthResponse = {
  token: string;
  user: BackendAuthUser;
};

export type RegisterAccountPayload = {
  username: string;
  email: string;
  password: string;
  companySlug?: string;
  recaptchaToken?: string;
};

export async function registerAccount(payload: RegisterAccountPayload) {
  return httpPost<BackendAuthResponse>(`${API_ROUTES.AUTH_SERVICE}/register`, payload);
}

export async function loginWithGoogle(payload: {
  idToken: string;
  companySlug?: string;
  recaptchaToken?: string;
}) {
  return httpPost<BackendAuthResponse>(`${API_ROUTES.AUTH_SERVICE}/google`, payload);
}
