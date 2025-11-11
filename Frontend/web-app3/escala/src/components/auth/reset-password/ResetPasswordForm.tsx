'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  ResetPasswordSchema,
  ResetPasswordSchemaType,
} from '@/lib/schemas/auth/reset-password.schema';
import { httpPost } from '@/lib/http/request';

export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code'); // token enviado no email do Strapi

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      code: code || '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    const res = await httpPost('/api/auth/reset-password', data);
    if (res) {
      toast.success('Senha redefinida com sucesso! Faça login novamente.');
      router.push('/login');
    } else {
      toast.error('Erro ao redefinir senha. Verifique o código ou tente novamente.');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-background/60 mx-auto mt-16 max-w-md space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-center text-xl font-semibold">Redefinir Senha</h1>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nova senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Código de redefinição oculto */}
        <input type="hidden" {...form.register('code')} />

        <Button type="submit" className="w-full">
          Redefinir senha
        </Button>
      </form>
    </Form>
  );
};
