import { z } from 'zod';

export const LeadCaptureSchema = z.object({
  name: z.string().trim().min(3, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  companyName: z.string().trim().max(120, 'Nome da empresa muito longo').optional().or(z.literal('')),
  marketingConsentGranted: z
    .boolean()
    .refine((value) => value, 'Você precisa autorizar o tratamento para contato comercial'),
});

export type LeadCaptureSchemaType = z.infer<typeof LeadCaptureSchema>;
