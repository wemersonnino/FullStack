import { API_ROUTES } from '@/constants';
import { mapLandingPage, fallbackLandingPage, normalizeFeatures } from '@/dto/landing.dto';
import { LandingPageContent, LandingPricingPlan, LandingTestimonial } from '@/interfaces/landing/landing.interface';
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
    const localeParam = locale ? `&locale=${locale}` : '';
    const response = await httpGet<StrapiResponse<any>>(`${API_ROUTES.TESTIMONIALS}${localeParam}`);

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
    console.error('Erro ao buscar depoimentos do Strapi:', error);
    return fallbackTestimonials;
  }
}
