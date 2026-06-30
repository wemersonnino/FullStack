import { z } from "zod"

export const ResetPasswordSchema = z.object({
  code: z.string().min(3, "Código de redefinição é obrigatório"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  passwordConfirmation: z.string().min(8, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas não coincidem",
  path: ["passwordConfirmation"],
})

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>
