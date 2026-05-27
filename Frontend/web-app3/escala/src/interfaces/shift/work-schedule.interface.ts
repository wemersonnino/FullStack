export type FrequencyType = 'every_week' | 'every_two_weeks' | 'monthly';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface WorkSchedule {
  id: number;
  documentId: string;
  fixedDays: string;
  alternatingDay?: DayOfWeek;
  frequency: FrequencyType;
  minimumWeeklyShifts: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
