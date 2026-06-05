import { API_ROUTES } from '@/constants';
import { mapLandingPage, fallbackLandingPage } from '@/dto/landing.dto';
import { LandingPageContent } from '@/interfaces/landing/landing.interface';
import { httpGet } from '@/lib/http/request';

type StrapiSingleResponse<T> = {
  data?: T | null;
};

export async function getLandingPage(): Promise<LandingPageContent> {
  try {
    const response = await httpGet<StrapiSingleResponse<Record<string, any>>>(API_ROUTES.LANDING_PAGE);
    return mapLandingPage(response?.data);
  } catch (error) {
    console.error('Erro ao buscar landing page:', error);
    return fallbackLandingPage;
  }
}
