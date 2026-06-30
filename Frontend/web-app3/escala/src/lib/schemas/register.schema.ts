import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3, "Nome de usuário é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  companyName: z.string().min(3, "Nome da empresa é obrigatório"),
});
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
