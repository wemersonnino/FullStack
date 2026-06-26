import { normalizeStrapiUrl } from '@/lib/utils';
import {
  LandingCtaButton,
  LandingFaq,
  LandingFeature,
  LandingIconKey,
  LandingInfoCard,
  LandingIndustry,
  LandingMedia,
  LandingPageContent,
  LandingPricingPlan,
} from '@/interfaces/landing/landing.interface';

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
    url: normalizeStrapiUrl(file.url),
    alternativeText: file.alternativeText || file.name || 'Tela da plataforma Escala',
  };
}

function asFeature(item: AnyRecord): LandingFeature {
  const attrs = item.attributes ?? item;
  const iconKey = iconKeys.includes(attrs.iconKey) ? attrs.iconKey : 'calendar';
  return {
    id: item.documentId ?? item.id,
    title: attrs.title || 'Funcionalidade',
    description: attrs.description || '',
    category: attrs.category || 'scheduling',
    iconKey,
  };
}

function asIndustry(item: AnyRecord): LandingIndustry {
  const attrs = item.attributes ?? item;
  return {
    id: item.documentId ?? item.id,
    title: attrs.title || 'Setor atendido',
    segment: attrs.segment || 'other',
    valueProposition: attrs.valueProposition || '',
    description: attrs.description || '',
    highlightMetric: attrs.highlightMetric || '',
  };
}

export function normalizeFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function asPricingPlan(item: AnyRecord): LandingPricingPlan {
  const attrs = item.attributes ?? item;
  return {
    id: item.documentId ?? item.id,
    name: attrs.name || 'Plano Escala',
    description: attrs.description || '',
    priceLabel: attrs.priceLabel || 'R$ 0',
    trialDescription: attrs.trialDescription || '3 meses de teste gratuito',
    aiLimitDescription: attrs.aiLimitDescription || 'IA com periodo menor ou limite por creditos',
    features: normalizeFeatures(attrs.features),
    recommended: Boolean(attrs.recommended),
    ctaLabel: attrs.ctaLabel || 'Comecar agora',
    ctaUrl: attrs.ctaUrl || '/register',
  };
}

function asFaq(item: AnyRecord): LandingFaq {
  const attrs = item.attributes ?? item;
  return {
    id: item.documentId ?? item.id,
    question: attrs.question || '',
    answer: attrs.answer || '',
    category: attrs.category || 'product',
  };
}

function asCtaButton(item: AnyRecord): LandingCtaButton {
  const attrs = item.attributes ?? item;
  return {
    id: item.documentId ?? item.id,
    label: attrs.label || 'Comecar agora',
    url: attrs.url || '/register',
    variant: attrs.variant || 'primary',
    location: attrs.location || 'hero',
  };
}

function asInfoCard(item: AnyRecord, index: number): LandingInfoCard {
  const attrs = item.attributes ?? item;
  const iconKey = iconKeys.includes(attrs.iconKey) ? attrs.iconKey : 'shield';
  return {
    id: item.id ?? attrs.title ?? index,
    title: attrs.title || '',
    description: attrs.description || '',
    iconKey,
  };
}

export const fallbackLandingPage: LandingPageContent = {
  pageKey: 'home',
  slug: 'home',
  eyebrow: 'SaaS B2B de Gestão Inteligente',
  heroTitle: 'Elimine o Caos das Escalas de Trabalho com Inteligência Artificial',
  heroDescription:
    'Controle escalas, jornada, ponto e geolocalização em uma única plataforma. Projetado para operações que não podem parar.',
  primaryCtaLabel: 'Começar Teste Grátis (14 dias)',
  primaryCtaUrl: '/register',
  secondaryCtaLabel: 'Solicitar Demonstração',
  secondaryCtaUrl: '/demo',
  trialDescription: '14 dias de acesso total para você e seu time.',
  aiTrialDescription: 'IA Assistente: 7 dias ou 20 consultas gratuitas.',
  securityStatement: 'Conformidade total com LGPD, Portaria 671 e suporte ao novo CNPJ Alfanumérico.',
  demoEyebrow: 'Demo',
  demoTitle: 'Veja a operacao antes de conversar com vendas.',
  demoDescription:
    'A demonstracao mostra como a plataforma organiza escalas, aponta limites comerciais e captura leads com consentimento explicito.',
  demoCards: [
    {
      id: 'secure-flow',
      title: 'Fluxo comercial seguro',
      description: 'O lead entra pelo BFF publico e chega ao backend com UTM, referrer e consentimento.',
      iconKey: 'shield',
    },
    {
      id: 'business-context',
      title: 'Atendimento orientado ao negocio',
      description: 'A equipe comercial recebe contexto suficiente para responder com foco em conversao.',
      iconKey: 'users',
    },
  ],
  demoLinkLabel: 'Abrir pagina de demo',
  demoLinkUrl: '/demo',
  demoFormTitle: 'Receba uma proposta guiada',
  demoFormDescription: 'Deixe seu contato e a gente responde com uma demonstracao focada na sua operacao.',
  featuresEyebrow: 'Modulos',
  featuresTitle: 'Operacao, regras e auditoria no mesmo fluxo.',
  industriesEyebrow: 'Setores',
  industriesTitle: 'Preparado para operacoes com ritmos diferentes.',
  pricingEyebrow: 'Planos',
  pricingTitle: 'Teste comercial com controle de custo da IA.',
  faqEyebrow: 'FAQ',
  faqTitle: 'Perguntas frequentes.',
  blogEyebrow: 'Conteudo',
  blogTitle: 'Conteudo para gestores.',
  blogDescription: 'Artigos editoriais continuam vindo do Strapi.',
  blogLinkLabel: 'Ver artigos',
  blogLinkUrl: '/artigos',
  features: [
    {
      id: 'scheduling',
      title: 'Escalas 12x36 e 6x1',
      description: 'Configuração automática de jornadas complexas com validação de descansos e DSR.',
      category: 'scheduling',
      iconKey: 'calendar',
    },
    {
      id: 'geofencing',
      title: 'Geofencing Avançado',
      description: 'Registro de ponto validado por GPS e IP. Crie cercas digitais para seus postos de trabalho.',
      category: 'security',
      iconKey: 'map-pin',
    },
    {
      id: 'ai',
      title: 'IA Assistente',
      description: 'Sugestão de substitutos para faltas e análise preditiva de riscos de escala.',
      category: 'ai',
      iconKey: 'sparkles',
    },
    {
      id: 'cnpj',
      title: 'Novo CNPJ Alfanumérico',
      description: 'Primeiro SaaS do Brasil preparado para o novo padrão de identificação da Receita Federal.',
      category: 'security',
      iconKey: 'shield',
    },
  ],
  industries: [
    {
      id: 'healthcare',
      title: 'Saúde (Hospitais e Clínicas)',
      segment: 'healthcare',
      valueProposition: 'Plantões sem furos. Gerencie escalas médicas e assistenciais com precisão cirúrgica e compliance financeiro.',
      description: 'Cobertura de plantões críticos com menos risco de multa e menos substituições de última hora.',
      highlightMetric: 'Plantão 100% coberto',
    },
    {
      id: 'security',
      title: 'Segurança e Facilities',
      segment: 'security',
      valueProposition: 'Evidência de presença em tempo real. Prove para seu cliente que o posto está coberto via geofencing avançado.',
      description: 'Controle por posto, contrato e turno para reduzir perda de receita por medição incorreta.',
      highlightMetric: 'Posto sem lacunas',
    },
    {
      id: 'logistics',
      title: 'Terceirização e Logística',
      segment: 'logistics',
      valueProposition: 'Gestão distribuída simplificada. Controle equipes em campo sem perder o rastro da produtividade.',
      description: 'Planejamento de capacidade por projeto, disponibilidade e modalidade presencial/remoto/híbrida.',
      highlightMetric: 'Produtividade Visível',
    },
  ],
  pricingPlans: [
    {
      id: 'essencial',
      name: 'Essencial',
      description: 'Ideal para pequenos times que precisam organizar a casa.',
      priceLabel: 'R$ 9,90',
      trialDescription: '14 dias de teste grátis',
      aiLimitDescription: 'Google SSO incluso',
      recommended: false,
      ctaLabel: 'Começar Agora',
      ctaUrl: '/register?plan=essencial',
      features: ['Escalas 5x2 e 6x1', 'Ponto Web simples', 'Relatórios básicos', 'Google SSO'],
    },
    {
      id: 'profissional',
      name: 'Profissional',
      description: 'O poder da geolocalização e automação para sua empresa.',
      priceLabel: 'R$ 16,90',
      trialDescription: '30 dias de teste qualificado',
      aiLimitDescription: 'IA Trial (20 consultas)',
      recommended: true,
      ctaLabel: 'Teste Profissional',
      ctaUrl: '/register?plan=profissional',
      features: ['Tudo do Essencial', 'Ponto com Geofencing', 'Gestão de Trocas', 'IA Trial (20 consultas)', 'Dashboards de Gestão'],
    },
    {
      id: 'critica',
      name: 'Operação Crítica',
      description: 'Controle total para grandes volumes e postos 24/7.',
      priceLabel: 'R$ 29,90',
      trialDescription: 'Piloto de 60 dias',
      aiLimitDescription: 'IA Full (Créditos inclusos)',
      recommended: false,
      ctaLabel: 'Agendar Piloto',
      ctaUrl: '/demo?plan=critica',
      features: ['Tudo do Profissional', 'Gestão de Postos e Alocação', 'Escalas 12x36 ilimitadas', 'IA Full', 'Audit Log avançado'],
    },
  ],
  faqs: [
    {
      id: 'trial',
      question: 'O teste gratuito da aplicação dura quanto tempo?',
      answer: 'O modelo comercial previsto é de 3 meses para a aplicação principal, permitindo validar todos os fluxos operacionais.',
      category: 'trial',
    },
    {
      id: 'ai',
      question: 'A IA também fica liberada por 3 meses?',
      answer: 'Não necessariamente. O módulo de IA possui um período de teste de 14 dias ou limite por créditos/tokens para controle de custo operacional.',
      category: 'ai',
    },
    {
      id: 'strapi',
      question: 'O Strapi autentica usuários finais?',
      answer: 'Não. O Strapi fica restrito à gestão de conteúdo (CMS). Usuários finais autenticam de forma segura contra o backend Spring Boot.',
      category: 'lgpd',
    },
    {
      id: 'cnpj',
      question: 'O sistema aceita o novo CNPJ Alfanumérico?',
      answer: 'Sim. O Escala é pioneiro na adaptação ao padrão 2026 da Receita Federal, garantindo que sua empresa esteja sempre em conformidade.',
      category: 'legal',
    },
    {
      id: 'offline',
      question: 'Posso usar em locais sem sinal de internet?',
      answer: 'Sim. Nosso registro de ponto offline sincroniza automaticamente com o servidor assim que o dispositivo recuperar a conexão.',
      category: 'tech',
    },
  ],
  ctaButtons: [],
};

export function mapLandingPage(data?: any): LandingPageContent {
  if (!data) return fallbackLandingPage;

  // Normalizar: Strapi v4/v5 podem retornar { data: [...] }, { data: { attributes: ... } } ou o objeto direto
  let entry = data;
  if (data.data) {
    entry = Array.isArray(data.data) ? data.data[0] : data.data;
  } else if (Array.isArray(data)) {
    entry = data[0];
  }

  if (!entry) {
    return fallbackLandingPage;
  }

  // Atributos podem estar na raiz (v5) ou em .attributes (v4/v5 wrapper)
  const attrs = entry.attributes ?? entry;

  // Helper Greedy para extrair campo
  const get = (field: string, fallback: any) => {
    // 1. Tentar variações comuns de nome (camelCase, snake_case, lowercase)
    const variations = [
      field,
      field.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`),
      field.toLowerCase()
    ];
    
    let value: any;
    for (const v of variations) {
      value = attrs[v] ?? entry[v] ?? (entry.attributes ? entry.attributes[v] : undefined);
      if (value !== undefined && value !== null && value !== '') break;
    }

    // 2. Se o valor for um objeto (comum em i18n ou plugins), tentar extrair o texto
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (typeof value.value === 'string') return value.value;
      // Se for um componente de tradução
      const keys = ['pt-BR', 'pt', 'en', 'value', 'text'];
      for (const k of keys) {
        if (typeof value[k] === 'string') return value[k];
      }
    }

    return (value !== undefined && value !== null && value !== '') ? String(value) : fallback;
  };

  const content: LandingPageContent = {
    pageKey: get('pageKey', fallbackLandingPage.pageKey) as any,
    slug: get('slug', fallbackLandingPage.slug),
    eyebrow: get('eyebrow', fallbackLandingPage.eyebrow),
    heroTitle: get('heroTitle', fallbackLandingPage.heroTitle),
    heroDescription: get('heroDescription', fallbackLandingPage.heroDescription),
    heroImage: mapMedia(attrs.heroImage ?? entry.heroImage),
    heroBackgroundImage: mapMedia(attrs.heroBackgroundImage ?? entry.heroBackgroundImage),
    sectionBackgroundImage: mapMedia(attrs.sectionBackgroundImage ?? entry.sectionBackgroundImage),
    primaryCtaLabel: get('primaryCtaLabel', fallbackLandingPage.primaryCtaLabel),
    primaryCtaUrl: get('primaryCtaUrl', fallbackLandingPage.primaryCtaUrl),
    secondaryCtaLabel: get('secondaryCtaLabel', fallbackLandingPage.secondaryCtaLabel),
    secondaryCtaUrl: get('secondaryCtaUrl', fallbackLandingPage.secondaryCtaUrl),
    trialDescription: get('trialDescription', fallbackLandingPage.trialDescription),
    aiTrialDescription: get('aiTrialDescription', fallbackLandingPage.aiTrialDescription),
    securityStatement: get('securityStatement', fallbackLandingPage.securityStatement),
    demoEyebrow: get('demoEyebrow', fallbackLandingPage.demoEyebrow),
    demoTitle: get('demoTitle', fallbackLandingPage.demoTitle),
    demoDescription: get('demoDescription', fallbackLandingPage.demoDescription),
    demoCards: pickArray(attrs.demoCards ?? entry.demoCards)
      .map((item, idx) => asInfoCard(item, idx))
      .filter((item) => item.title && item.description),
    demoLinkLabel: get('demoLinkLabel', fallbackLandingPage.demoLinkLabel),
    demoLinkUrl: get('demoLinkUrl', fallbackLandingPage.demoLinkUrl),
    demoFormTitle: get('demoFormTitle', fallbackLandingPage.demoFormTitle),
    demoFormDescription: get('demoFormDescription', fallbackLandingPage.demoFormDescription),
    featuresEyebrow: get('featuresEyebrow', fallbackLandingPage.featuresEyebrow),
    featuresTitle: get('featuresTitle', fallbackLandingPage.featuresTitle),
    industriesEyebrow: get('industriesEyebrow', fallbackLandingPage.industriesEyebrow),
    industriesTitle: get('industriesTitle', fallbackLandingPage.industriesTitle),
    pricingEyebrow: get('pricingEyebrow', fallbackLandingPage.pricingEyebrow),
    pricingTitle: get('pricingTitle', fallbackLandingPage.pricingTitle),
    faqEyebrow: get('faqEyebrow', fallbackLandingPage.faqEyebrow),
    faqTitle: get('faqTitle', fallbackLandingPage.faqTitle),
    blogEyebrow: get('blogEyebrow', fallbackLandingPage.blogEyebrow),
    blogTitle: get('blogTitle', fallbackLandingPage.blogTitle),
    blogDescription: get('blogDescription', fallbackLandingPage.blogDescription),
    blogLinkLabel: get('blogLinkLabel', fallbackLandingPage.blogLinkLabel),
    blogLinkUrl: get('blogLinkUrl', fallbackLandingPage.blogLinkUrl),
    features: pickArray(attrs.features ?? entry.features).map(asFeature).filter((item) => item.title && item.description),
    industries: pickArray(attrs.industries ?? entry.industries).map(asIndustry).filter((item) => item.title && item.valueProposition),
    pricingPlans: pickArray(attrs.pricingPlans ?? entry.pricingPlans).map(asPricingPlan),
    faqs: pickArray(attrs.faqs ?? entry.faqs).map(asFaq).filter((item) => item.question && item.answer),
    ctaButtons: pickArray(attrs.ctaButtons ?? entry.ctaButtons).map(asCtaButton).filter((item) => item.label && item.url),
    vslTitle: get('vslTitle', undefined),
    vslVideoUrl: get('vslVideoUrl', undefined),
    vslScript: get('vslScript', undefined),
  };

  // Garante que arrays nunca fiquem vazios se houver fallback disponível
  return {
    ...content,
    demoCards: content.demoCards.length ? content.demoCards : fallbackLandingPage.demoCards,
    features: content.features.length ? content.features : fallbackLandingPage.features,
    industries: content.industries.length ? content.industries : fallbackLandingPage.industries,
    pricingPlans: content.pricingPlans.length ? content.pricingPlans : fallbackLandingPage.pricingPlans,
    faqs: content.faqs.length ? content.faqs : fallbackLandingPage.faqs,
  };
}
