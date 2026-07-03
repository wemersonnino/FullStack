import { API_ROUTES } from '@/constants';
import { strapiGet } from '@/lib/strapi/request';
import { FooterInterface } from '@/interfaces/footer/footer.interface';
import { mapFooter } from '@/dto';

export async function getFooter(): Promise<FooterInterface | null> {
  try {
    const json = await strapiGet<{ data: any }>(API_ROUTES.FOOTER);
    const data = json?.data;
    if (!data) return null;

    return mapFooter(data);
  } catch (error) {
    console.error('Erro ao buscar footer:', error);
    return null;
  }
}
