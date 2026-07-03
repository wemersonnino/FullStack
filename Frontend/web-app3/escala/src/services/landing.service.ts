import { API_ROUTES, ENV } from '@/constants';
import { mapLandingPage, fallbackLandingPage, normalizeFeatures } from '@/dto/landing.dto';
import { LandingPageContent, LandingPricingPlan, LandingTestimonial } from '@/interfaces/landing/landing.interface';
import { strapiGet } from '@/lib/strapi/request';

type StrapiResponse<T> = {
  data?: T[];
};

const PUBLIC_CONTENT_ROUTES = {
  landing: API_ROUTES.LANDING_PAGE,
  pricingPlans: API_ROUTES.PRICING_PLAN_CONTENTS,
  testimonials: API_ROUTES.TESTIMONIALS,
} as const;

function getPublicContentRoute(
  browserRoute: string,
  serverRoute: (typeof PUBLIC_CONTENT_ROUTES)[keyof typeof PUBLIC_CONTENT_ROUTES],
) {
  return ENV.IS_SERVER ? serverRoute : browserRoute;
}

export async function getLandingPage(options: { 
  locale?: string; 
  pageKey?: string; 
  slug?: string 
} = {}): Promise<LandingPageContent> {
  const { locale, pageKey = 'home', slug } = options;

  try {
    const response = await strapiGet<any>(
      getPublicContentRoute(
        API_ROUTES.CONTENT_LANDING,
        PUBLIC_CONTENT_ROUTES.landing,
      ),
      { locale, pageKey, slug },
      { throwOnError: true }
    );

    if (!response) {
      return fallbackLandingPage;
    }

    return mapLandingPage(response);
  } catch (error) {
    console.error('[LandingService] Erro ao recuperar Landing Page:', error);
    return fallbackLandingPage;
  }
}

export async function getPricingPlans(locale?: string): Promise<LandingPricingPlan[]> {
  try {
    const response = await strapiGet<StrapiResponse<any>>(
      getPublicContentRoute(
        API_ROUTES.CONTENT_PRICING_PLANS,
        PUBLIC_CONTENT_ROUTES.pricingPlans,
      ),
      { locale },
      { throwOnError: true }
    );
    
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
    console.error('Erro ao buscar planos:', error);
    return fallbackLandingPage.pricingPlans;
  }
}

export const fallbackTestimonials: LandingTestimonial[] = [
  {
    id: 'varejo-6x1',
    title: 'Menos ajuste manual no fechamento do mês',
    authorName: 'Gestora de Operações',
    authorRole: 'Rede de varejo com escala 6x1',
    content:
      'O maior ganho foi parar de conferir folga e feriado em várias abas de planilha. A equipe passou a revisar a escala por alerta e contador.',
  },
  {
    id: 'facilities',
    title: 'Trocas com histórico e menos ruído',
    authorName: 'Coordenador de Facilities',
    authorRole: 'Operação multiunidade',
    content:
      'Antes, parte das trocas ficava perdida em mensagens. O fluxo com solicitação, aceite e aprovação deixa claro quem pediu e qual escala mudou.',
  },
  {
    id: 'clinica',
    title: 'Demo já chega com contexto comercial',
    authorName: 'Responsável de RH',
    authorRole: 'Clínica com plantões 12x36',
    content:
      'O formulário direcionou a conversa para o template certo. A demonstração começou pelo problema real: plantão, feriado e cobertura mínima.',
  },
];

export async function getTestimonials(locale?: string): Promise<LandingTestimonial[]> {
  try {
    const response = await strapiGet<StrapiResponse<any>>(
      getPublicContentRoute(
        API_ROUTES.CONTENT_TESTIMONIALS,
        PUBLIC_CONTENT_ROUTES.testimonials,
      ),
      { locale },
      { throwOnError: true }
    );

    if (!response?.data || response.data.length === 0) {
      return fallbackTestimonials;
    }

    return response.data.map((item: any) => {
      const attrs = item.attributes ?? item;
      return {
        id: item.documentId ?? item.id,
        title: attrs.title || 'Operação com menos retrabalho',
        authorName: attrs.authorName || 'Cliente anonimizando',
        authorRole: attrs.authorRole || 'Operação B2B',
        content: attrs.content || '',
      };
    }).filter((item) => item.content);
  } catch (error) {
    console.error('Erro ao buscar depoimentos:', error);
    return fallbackTestimonials;
  }
}
