export type LandingIconKey =
  | 'calendar'
  | 'clock'
  | 'map-pin'
  | 'bar-chart'
  | 'shield'
  | 'sparkles'
  | 'users'
  | 'shuffle';

export interface LandingMedia {
  url: string;
  alternativeText: string;
}

export interface LandingFeature {
  id: number | string;
  title: string;
  description: string;
  category: string;
  iconKey: LandingIconKey;
}

export interface LandingIndustry {
  id: number | string;
  title: string;
  segment: string;
  valueProposition: string;
  description?: string;
  highlightMetric?: string;
}

export interface LandingPricingPlan {
  id: number | string;
  name: string;
  description?: string;
  priceLabel: string;
  trialDescription: string;
  aiLimitDescription: string;
  features: string[];
  recommended: boolean;
  ctaLabel: string;
  ctaUrl: string;
}

export interface LandingFaq {
  id: number | string;
  question: string;
  answer: string;
  category: string;
}

export interface LandingCtaButton {
  id: number | string;
  label: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline' | 'link';
  location: 'hero' | 'pricing' | 'demo' | 'footer' | 'onboarding';
}

export interface LandingPageContent {
  eyebrow?: string;
  heroTitle: string;
  heroDescription: string;
  heroImage?: LandingMedia;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  trialDescription: string;
  aiTrialDescription: string;
  securityStatement: string;
  features: LandingFeature[];
  industries: LandingIndustry[];
  pricingPlans: LandingPricingPlan[];
  faqs: LandingFaq[];
  ctaButtons: LandingCtaButton[];
}
