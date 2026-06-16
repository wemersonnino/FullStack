'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginSchemaType } from '@/lib/schemas/login.schema';
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
import { useSearchParams } from 'next/navigation';

export const LoginForm = () => {
  const { login, loginGoogle } = useAuth();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    await login(data.email, data.password);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-background/60 mx-auto mt-16 max-w-md space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-center text-xl font-semibold">Acessar conta</h1>

        {selectedPlan && (
          <div className="rounded-md bg-primary/10 p-3 text-center text-sm font-medium text-primary">
            Retornando para assinar o plano: <span className="font-bold">{selectedPlan}</span>
          </div>
        )}

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
          Entrar
        </Button>

        {ENV.GOOGLE_CLIENT_ID ? (
          <Button type="button" variant="outline" className="w-full" onClick={loginGoogle}>
            <Chrome className="mr-2 size-4" />
            Entrar com Google
          </Button>
        ) : null}

        <div className="flex flex-col gap-2 pt-2">
          <p className="text-muted-foreground text-center text-sm">
            Não tem uma conta?{' '}
            <a href={selectedPlan ? `/register?plan=${selectedPlan}` : "/register"} className="underline">
              Cadastre-se
            </a>
          </p>
          <p className="text-muted-foreground text-center text-sm">
            <a href="/forgot-password" className="underline">
              Esqueci minha senha
            </a>
          </p>
        </div>
      </form>
    </Form>
  );
};
