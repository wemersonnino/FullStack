import { z } from 'zod';

const phoneRegex = /^(\+?55)?\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const LeadCaptureSchema = z.object({
  name: z.string().trim().min(3, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Informe um telefone brasileiro válido')
    .optional()
    .or(z.literal('')),
  companyName: z.string().trim().max(120, 'Nome da empresa muito longo').optional().or(z.literal('')),
  employeeRange: z.string().min(1, 'Selecione a faixa de colaboradores'),
  companySegment: z.string().min(1, 'Selecione o segmento'),
  marketingConsentGranted: z
    .boolean()
    .refine((value) => value, 'Você precisa autorizar o tratamento para contato comercial'),
});

export type LeadCaptureSchemaType = z.infer<typeof LeadCaptureSchema>;
