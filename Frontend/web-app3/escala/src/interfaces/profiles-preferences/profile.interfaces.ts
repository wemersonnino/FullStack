
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { LanguagesEnum } from '@/interfaces/enums/languages.enum';

export interface ProfilePreferences {
  theme: ThemeEnum
  language: LanguagesEnum;
  timezone: string;
  notifications: boolean;
}