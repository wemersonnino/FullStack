// src/services/profile.service.ts
import { httpPut } from "@/lib/http/request"
import { ThemeEnum } from "@/interfaces/enums/theme.enum"
import { API_ROUTES } from "@/constants";

export async function updateUserTheme(theme: ThemeEnum) {
  return await httpPut(API_ROUTES.UPDATE_USER_THEME, { theme })
}
