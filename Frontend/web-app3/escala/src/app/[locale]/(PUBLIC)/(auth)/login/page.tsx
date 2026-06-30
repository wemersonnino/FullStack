import { LoginForm } from '@/components/auth/login/LoginForm';
import { getOptionalServerAccessToken } from '@/lib/auth/server-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = { title: 'Login | Plataforma Escala' };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const accessToken = await getOptionalServerAccessToken();

  if (accessToken) {
    const { locale } = await params;
    redirect(`/${locale}/dashboard`);
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
