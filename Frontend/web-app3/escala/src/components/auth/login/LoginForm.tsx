'use client';

import { useEffect, useState } from 'react';
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
import { Chrome, Eye, EyeOff } from 'lucide-react';
import { ENV } from '@/constants/env';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export const LoginForm = () => {
  const { login, loginGoogle } = useAuth();
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    const locale = pathname.split('/').filter(Boolean)[0] || 'pt-BR';
    const destination = selectedPlan
      ? `/${locale}/dashboard/billing/plans`
      : `/${locale}/dashboard`;

    router.replace(destination);
  }, [pathname, router, selectedPlan, status]);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    const success = await login(data.email, data.password);
    if (!success) {
      form.setError('root', {
        type: 'server',
        message: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
      });
      form.setError('email', { type: 'server', message: ' ' });
      form.setError('password', { type: 'server', message: ' ' });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        method="POST"
        className="bg-background/60 mx-auto mt-16 max-w-md space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-center text-xl font-semibold">Acessar conta</h1>

        {form.formState.errors.root?.message && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        {selectedPlan && (
          <div className="bg-primary/10 text-primary rounded-md p-3 text-center text-sm font-medium">
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
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="******"
                    className="pr-10"
                    autoComplete="current-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" isLoading={form.formState.isSubmitting}>
          Entrar
        </Button>

        {ENV.GOOGLE_AUTH_ENABLED ? (
          <Button type="button" variant="outline" className="w-full" onClick={loginGoogle}>
            <Chrome className="mr-2 size-4" />
            Entrar com Google
          </Button>
        ) : null}

        <div className="flex flex-col gap-2 pt-2">
          <p className="text-muted-foreground text-center text-sm">
            Não tem uma conta?{' '}
            <a
              href={selectedPlan ? `/register?plan=${selectedPlan}` : '/register'}
              className="underline"
            >
              Cadastre-se
            </a>
          </p>
          <Link href="/forgot-password" className="underline">
            <span className="text-muted-foreground text-center text-sm">Esqueci minha senha</span>
          </Link>
        </div>
      </form>
    </Form>
  );
};
