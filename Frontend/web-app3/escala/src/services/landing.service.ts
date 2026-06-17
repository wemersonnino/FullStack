import { API_ROUTES } from '@/constants';
import { ENV } from '@/constants/env';
import { mapLandingPage, fallbackLandingPage, normalizeFeatures } from '@/dto/landing.dto';
import { LandingPageContent, LandingPricingPlan } from '@/interfaces/landing/landing.interface';
import { httpGet } from '@/lib/http/request';

type StrapiResponse<T> = {
  data?: T[];
};

export async function getLandingPage(locale?: string): Promise<LandingPageContent> {
  try {
    const localeParam = locale ? `&locale=${locale}` : '';
    const pageKey = encodeURIComponent(ENV.HOME_LANDING_PAGE_KEY);
    const url = `${API_ROUTES.LANDING_PAGE}&filters[pageKey][$eq]=${pageKey}${localeParam}`;
    const response = await httpGet<{ data?: any[] }>(url);
    return mapLandingPage(response?.data);
  } catch (error) {
    console.error('Erro ao buscar landing page:', error);
    return fallbackLandingPage;
  }
}

export async function getPricingPlans(locale?: string): Promise<LandingPricingPlan[]> {
  try {
    const localeParam = locale ? `&locale=${locale}` : '';
    const url = `${API_ROUTES.PRICING_PLAN_CONTENTS}${localeParam}`;
    const response = await httpGet<StrapiResponse<any>>(url);
    
    if (!response?.data || response.data.length === 0) {
      return fallbackLandingPage.pricingPlans;
    }

    return response.data.map((item: any) => ({
      id: item.documentId ?? item.id,
      name: item.name,
      description: item.description,
      priceLabel: item.priceLabel,
      trialDescription: item.trialDescription,
      aiLimitDescription: item.aiLimitDescription,
      features: normalizeFeatures(item.features),
      recommended: Boolean(item.recommended),
      ctaLabel: item.ctaLabel,
      ctaUrl: item.ctaUrl,
    }));
  } catch (error) {
    console.error('Erro ao buscar planos do Strapi:', error);
    return fallbackLandingPage.pricingPlans;
  }
}
