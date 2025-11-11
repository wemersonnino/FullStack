import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3, "Nome de usuário é obrigatório"),
  email: z.email({pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido"}),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;