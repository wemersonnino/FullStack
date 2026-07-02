import { Holiday } from '@/interfaces/holiday.interface';
import { httpGet } from '@/lib/http/request';

export async function getHolidays(year: number): Promise<Holiday[]> {
  return (await httpGet<Holiday[]>(`/api/bff/external/holidays/${year}`)) ?? [];
}
