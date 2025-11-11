import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('Email inválido'), // Adicione .email() aqui
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  username: z.string().min(3, 'Nome de usuário é obrigatório'),
  email: z.email({ pattern: z.regexes.html5Email }),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.email('Email inválido'),
});
export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;
