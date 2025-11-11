import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.email({pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido'}),
});
export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;