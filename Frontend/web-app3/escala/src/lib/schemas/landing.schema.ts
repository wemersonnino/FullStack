import { z } from 'zod';

export const LandingPageSchema = z.object({
  heroTitle: z.string().min(1),
  heroDescription: z.string().min(1),
  primaryCtaLabel: z.string().min(1),
  primaryCtaUrl: z.string().min(1),
  secondaryCtaLabel: z.string().min(1),
  secondaryCtaUrl: z.string().min(1),
  trialDescription: z.string().min(1),
  aiTrialDescription: z.string().min(1),
  securityStatement: z.string().min(1),
});
