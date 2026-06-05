import { normalizeImageUrlStrapi } from '@/lib/utils';
import {
  LandingCtaButton,
  LandingFaq,
  LandingFeature,
  LandingIconKey,
  LandingIndustry,
  LandingMedia,
  LandingPageContent,
  LandingPricingPlan,
} from '@/interfaces/landing/landing.interface';
import { LandingPageSchema } from '@/lib/schemas/landing.schema';

type AnyRecord = Record<string, any>;

const iconKeys: LandingIconKey[] = ['calendar', 'clock', 'map-pin', 'bar-chart', 'shield', 'sparkles', 'users', 'shuffle'];

function pickArray(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray((value as AnyRecord).data)) {
    return (value as AnyRecord).data;
  }
  return [];
}

function mapMedia(media: AnyRecord | null | undefined): LandingMedia | undefined {
  if (!media) return undefined;
  const file = media.data ?? media;
  if (!file?.url) return undefined;

  return {
    url: normalizeImageUrlStrapi(file.url),
    alternativeText: file.alternativeText || file.name || 'Tela da plataforma Escala',
  };
}

function asFeature(item: AnyRecord): LandingFeature {
  const iconKey = iconKeys.includes(item.iconKey) ? item.iconKey : 'calendar';
  return {
    id: item.documentId ?? item.id,
    title: item.title || 'Funcionalidade',
    description: item.description || '',
    category: item.category || 'scheduling',
    iconKey,
  };
}

function asIndustry(item: AnyRecord): LandingIndustry {
  return {
    id: item.documentId ?? item.id,
    title: item.title || 'Setor atendido',
    segment: item.segment || 'other',
    valueProposition: item.valueProposition || '',
    description: item.description || '',
    highlightMetric: item.highlightMetric || '',
  };
}

function normalizeFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function asPricingPlan(item: AnyRecord): LandingPricingPlan {
  return {
    id: item.documentId ?? item.id,
    name: item.name || 'Plano Escala',
    description: item.description || '',
    priceLabel: item.priceLabel || 'R$ 0',
    trialDescription: item.trialDescription || '3 meses de teste gratuito',
    aiLimitDescription: item.aiLimitDescription || 'IA com periodo menor ou limite por creditos',
    features: normalizeFeatures(item.features),
    recommended: Boolean(item.recommended),
    ctaLabel: item.ctaLabel || 'Comecar agora',
    ctaUrl: item.ctaUrl || '/register',
  };
}

function asFaq(item: AnyRecord): LandingFaq {
  return {
    id: item.documentId ?? item.id,
    question: item.question || '',
    answer: item.answer || '',
    category: item.category || 'product',
  };
}

function asCtaButton(item: AnyRecord): LandingCtaButton {
  return {
    id: item.documentId ?? item.id,
    label: item.label || 'Comecar agora',
    url: item.url || '/register',
    variant: item.variant || 'primary',
    location: item.location || 'hero',
  };
}

export const fallbackLandingPage: LandingPageContent = {
  eyebrow: 'Gestao inteligente de escalas B2B',
  heroTitle: 'Escala SaaS',
  heroDescription:
    'Automatize escalas, trocas, ponto digital, banco de horas e relatorios com regras trabalhistas brasileiras parametrizadas e arquitetura preparada para IA.',
  primaryCtaLabel: 'Comecar teste de 3 meses',
  primaryCtaUrl: '/register',
  secondaryCtaLabel: 'Ver modulos',
  secondaryCtaUrl: '#modulos',
  trialDescription: 'Aplicacao com 3 meses de teste gratuito para sua empresa validar a operacao completa.',
  aiTrialDescription: 'IA assistiva com liberacao menor ou limite por creditos para controlar custo operacional.',
  securityStatement: 'Autorizacao no backend, minimizacao de dados pessoais, auditoria e separacao clara entre CMS e regras criticas de negocio.',
  features: [
    {
      id: 'scheduling',
      title: 'Escalas com regras trabalhistas',
      description: 'Valide jornada diaria, semanal, mensal, intervalos, DSR, 5x2, 6x1 e 12x36 antes da publicacao.',
      category: 'scheduling',
      iconKey: 'calendar',
    },
    {
      id: 'swaps',
      title: 'Trocas com aprovacao',
      description: 'Organize solicitacoes, aceite do colega e aprovacao final do gestor com trilha auditavel.',
      category: 'scheduling',
      iconKey: 'shuffle',
    },
    {
      id: 'time-clock',
      title: 'Ponto digital preparado',
      description: 'Base para ponto online/offline, geolocalizacao, inconsistencias e fechamento de folha.',
      category: 'time_clock',
      iconKey: 'clock',
    },
    {
      id: 'ai',
      title: 'IA assistiva com governanca',
      description: 'Sugestoes de escala e explicacao de conflitos com cotas por tenant e minimizacao de dados sensiveis.',
      category: 'ai',
      iconKey: 'sparkles',
    },
  ],
  industries: [
    {
      id: 'healthcare',
      title: 'Clinicas e hospitais',
      segment: 'healthcare',
      valueProposition: 'Cobertura de plantoes criticos com menos risco de multa e menos substituicoes de ultima hora.',
      highlightMetric: 'Plantao coberto',
    },
    {
      id: 'security',
      title: 'Seguranca e terceirizadas',
      segment: 'security',
      valueProposition: 'Controle por posto, contrato e turno para reduzir perda de receita por medicao incorreta.',
      highlightMetric: 'Posto sem lacuna',
    },
    {
      id: 'technology',
      title: 'Tecnologia e home office',
      segment: 'technology',
      valueProposition: 'Planejamento de capacidade por projeto, disponibilidade e modalidade presencial/remoto/hibrido.',
      highlightMetric: 'Capacidade visivel',
    },
  ],
  pricingPlans: [
    {
      id: 'trial',
      name: 'Plano Operacao',
      description: 'Base B2B para validar escalas, trocas, relatorios e governanca.',
      priceLabel: 'R$ 0',
      trialDescription: '3 meses de teste gratuito',
      aiLimitDescription: 'IA por 14 dias ou limite de creditos configuravel',
      recommended: true,
      ctaLabel: 'Iniciar teste',
      ctaUrl: '/register',
      features: ['Multi-tenant', 'Escalas mensais e anuais', 'Trocas de escala', 'Auditoria', 'Relatorios operacionais'],
    },
  ],
  faqs: [
    {
      id: 'trial',
      question: 'O teste gratuito da aplicacao dura quanto tempo?',
      answer: 'O modelo comercial previsto e de 3 meses para a aplicacao principal.',
      category: 'trial',
    },
    {
      id: 'ai',
      question: 'A IA tambem fica liberada por 3 meses?',
      answer: 'Nao necessariamente. O modulo de IA deve ter periodo menor ou limite por creditos/tokens para controlar custo operacional.',
      category: 'ai',
    },
    {
      id: 'lgpd',
      question: 'O Strapi autentica usuarios finais?',
      answer: 'Nao. O Strapi fica restrito ao CMS. Usuarios finais autenticam contra o backend Spring Boot.',
      category: 'lgpd',
    },
  ],
  ctaButtons: [],
};

export function mapLandingPage(data?: AnyRecord | null): LandingPageContent {
  if (!data) return fallbackLandingPage;

  const content: LandingPageContent = {
    eyebrow: data.eyebrow || fallbackLandingPage.eyebrow,
    heroTitle: data.heroTitle || fallbackLandingPage.heroTitle,
    heroDescription: data.heroDescription || fallbackLandingPage.heroDescription,
    heroImage: mapMedia(data.heroImage),
    primaryCtaLabel: data.primaryCtaLabel || fallbackLandingPage.primaryCtaLabel,
    primaryCtaUrl: data.primaryCtaUrl || fallbackLandingPage.primaryCtaUrl,
    secondaryCtaLabel: data.secondaryCtaLabel || fallbackLandingPage.secondaryCtaLabel,
    secondaryCtaUrl: data.secondaryCtaUrl || fallbackLandingPage.secondaryCtaUrl,
    trialDescription: data.trialDescription || fallbackLandingPage.trialDescription,
    aiTrialDescription: data.aiTrialDescription || fallbackLandingPage.aiTrialDescription,
    securityStatement: data.securityStatement || fallbackLandingPage.securityStatement,
    features: pickArray(data.features).map(asFeature).filter((item) => item.title && item.description),
    industries: pickArray(data.industries).map(asIndustry).filter((item) => item.title && item.valueProposition),
    pricingPlans: pickArray(data.pricingPlans).map(asPricingPlan),
    faqs: pickArray(data.faqs).map(asFaq).filter((item) => item.question && item.answer),
    ctaButtons: pickArray(data.ctaButtons).map(asCtaButton).filter((item) => item.label && item.url),
  };

  const validated = LandingPageSchema.safeParse(content);
  if (!validated.success) return fallbackLandingPage;

  return {
    ...content,
    features: content.features.length ? content.features : fallbackLandingPage.features,
    industries: content.industries.length ? content.industries : fallbackLandingPage.industries,
    pricingPlans: content.pricingPlans.length ? content.pricingPlans : fallbackLandingPage.pricingPlans,
    faqs: content.faqs.length ? content.faqs : fallbackLandingPage.faqs,
  };
}
