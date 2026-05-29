import axios from 'axios';
import { Holiday } from '@/interfaces/holiday.interface';

const BASE_URL = 'https://brasilapi.com.br/api/feriados/v1';

export async function getHolidays(year: number): Promise<Holiday[]> {
  try {
    const response = await axios.get<Holiday[]>(`${BASE_URL}/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar feriados para o ano ${year}:`, error);
    return [];
  }
}
