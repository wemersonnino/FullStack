'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ForgotPasswordSchema,
  ForgotPasswordSchemaType,
} from '@/lib/schemas/forgot-password.schema';
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
import { httpPost } from '@/lib/http/request';

export const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    const res = await httpPost('/api/auth/forgot-password', data);
    if (res) toast.success('Email de recuperação enviado!');
    else toast.error('Erro ao enviar email.');
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-background/60 mx-auto mt-16 max-w-md space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-center text-xl font-semibold">Recuperar senha</h1>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type={'email'} placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Enviar link de recuperação
        </Button>
      </form>
    </Form>
  );
};
