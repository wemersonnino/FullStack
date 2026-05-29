'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RegisterSchema, RegisterSchemaType } from '@/lib/schemas/register.schema';
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
import { useAuth } from '@/hooks/useAuth';
import { Chrome } from 'lucide-react';
import { ENV } from '@/constants/env';

export const RegisterForm = () => {
  const { register, loginGoogle } = useAuth();
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { username: '', email: '', password: '', companyName: '' },
  });

  const onSubmit = async (data: RegisterSchemaType) => {
    try {
      await register(data);
    } catch {
      toast.error('Erro ao registrar usuário.');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-background/60 mx-auto mt-16 max-w-md space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-center text-xl font-semibold">Criar conta</h1>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa / Clínica</FormLabel>
              <FormControl>
                <Input type={'text'} placeholder="Ex: Clínica Sorriso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de usuário</FormLabel>
              <FormControl>
                <Input type={'text'} placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Registrar
        </Button>
        {ENV.GOOGLE_CLIENT_ID ? (
          <Button type="button" variant="outline" className="w-full" onClick={loginGoogle}>
            <Chrome className="mr-2 size-4" />
            Cadastrar com Google
          </Button>
        ) : null}
        <p className="text-muted-foreground text-center text-sm">
          Já possui conta?{' '}
          <a href="/login" className="underline">
            Entrar
          </a>
        </p>
      </form>
    </Form>
  );
};
