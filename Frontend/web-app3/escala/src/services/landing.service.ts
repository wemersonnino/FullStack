import { API_ROUTES } from '@/constants';
import { mapLandingPage, fallbackLandingPage } from '@/dto/landing.dto';
import { LandingPageContent } from '@/interfaces/landing/landing.interface';
import { httpGet } from '@/lib/http/request';

type StrapiSingleResponse<T> = {
  data?: T | null;
};

export async function getLandingPage(locale?: string): Promise<LandingPageContent> {
  try {
    const localeParam = locale ? `&locale=${locale}` : '';
    const url = `${API_ROUTES.LANDING_PAGE}&filters[slug][$eq]=home${localeParam}`;
    const response = await httpGet<StrapiSingleResponse<Record<string, any>>>(url);
    return mapLandingPage(response?.data);
  } catch (error) {
    console.error('Erro ao buscar landing page:', error);
    return fallbackLandingPage;
  }
}
