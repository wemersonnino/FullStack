import { API_ROUTES } from '@/constants';
import { strapiGet } from '@/lib/strapi/request';
import { Banner } from '@/interfaces/banner/banner.interface';
import { mapBanners } from '@/dto/banner.dto';
import { StrapiResponse } from '@/interfaces/strapi/strapi-response.interface';

/**
 * Busca todos os banners disponíveis no Strapi.
 * Utiliza httpGet centralizado (Axios) e normaliza as URLs de imagem.
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const json = await strapiGet<StrapiResponse<Banner>>(API_ROUTES.BANNERS);
    if (!json?.data) return [];

    return mapBanners(json.data);
  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    return [];
  }
}
