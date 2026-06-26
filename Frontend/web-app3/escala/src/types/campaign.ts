export interface CampaignAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string;
  capturedAt: string;
}

export interface LeadCapturePayload {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  employeeRange?: string;
  companySegment?: string;
  marketingConsentGranted: boolean;
  consentVersion?: string;
  source?: string;
  landingPageSlug?: string;
  campaignSlug?: string;
}

export interface LeadCaptureResponse {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  marketingConsentGranted: boolean;
  personalEmail: boolean;
  recommendedPlan?: string;
  recommendedTemplate?: string;
  converted: boolean;
  message: string;
}

export interface CampaignPage {
  id: number;
  slug: string;
  title: string;
  startDate?: string;
  endDate?: string;
  channel?: string;
  landingPage?: LandingPage;
}

export interface LandingPage {
  id: number;
  slug: string;
  heroTitle: string;
  heroDescription: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  // ... other fields mapping Strapi schema
}
