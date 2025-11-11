import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email({pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message:'Email inválido'}),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;