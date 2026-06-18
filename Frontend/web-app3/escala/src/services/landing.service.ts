import { API_ROUTES } from '@/constants';
import { ENV } from '@/constants/env';
import { mapLandingPage, fallbackLandingPage, normalizeFeatures } from '@/dto/landing.dto';
import { LandingPageContent, LandingPricingPlan } from '@/interfaces/landing/landing.interface';
import { httpGet } from '@/lib/http/request';

type StrapiResponse<T> = {
  data?: T[];
};

export async function getLandingPage(options: { 
  locale?: string; 
  pageKey?: string; 
  slug?: string 
} = {}): Promise<LandingPageContent> {
  const { locale, pageKey = 'home', slug } = options;

  try {
    const localeParam = locale ? `&locale=${locale}` : '';
    const url = `${API_ROUTES.LANDING_PAGE}${localeParam}`;
    
    console.log(`[LandingService] Buscando landing pages (Role: ${pageKey}, Slug: ${slug || 'N/A'}): ${url}`);
    
    const response = await httpGet<{ data?: any[] }>(url);
    
    // Normalizar resposta Strapi v4/v5
    let allItems: any[] = [];
    if (response?.data) {
      allItems = Array.isArray(response.data) ? response.data : 
                 (Array.isArray((response.data as any).data) ? (response.data as any).data : [response.data]);
    }

    if (!allItems || allItems.length === 0) {
      console.warn('[LandingService] Nenhuma entrada encontrada na coleção Landing Pages.');
      return fallbackLandingPage;
    }

    // LÓGICA DE SELEÇÃO SEMÂNTICA:
    // 1. Se informamos um SLUG específico (ex: /lp/[slug]), ele é a prioridade absoluta.
    // 2. Se for a HOME, buscamos pelo pageKey='home'.
    // 3. FALLBACK DE TRANSIÇÃO: Se a home não estiver marcada com pageKey='home', buscamos por slugs conhecidos.
    // 4. FALLBACK DE SEGURANÇA: Primeira página disponível.
    
    const page = allItems.find(item => {
      const attrs = item.attributes ?? item;
      if (slug) return attrs.slug === slug;
      return attrs.pageKey === pageKey;
    }) || allItems.find(item => {
      const attrs = item.attributes ?? item;
      return pageKey === 'home' && (attrs.slug === 'home' || attrs.slug === 'landpage-home');
    }) || allItems[0];

    const foundSlug = (page.attributes ?? page).slug;
    console.log(`[LandingService] Página selecionada: ID=${page.id}, Slug=${foundSlug}`);
    
    return mapLandingPage(page);
  } catch (error) {
    console.error('[LandingService] Erro ao recuperar Landing Page:', error);
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
