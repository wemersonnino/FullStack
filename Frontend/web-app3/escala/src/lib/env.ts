import { z } from 'zod';

/**
 * Validação segura das variáveis de ambiente.
 * Evita builds com valores indefinidos ou incorretos.
 */
const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_STRAPI_API: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET é obrigatório'),
    NEXTAUTH_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Erro de validação das variáveis de ambiente:');
    console.error(parsed.error.format());
    throw new Error('Falha na validação do ambiente');
}

export const env = parsed.data;
