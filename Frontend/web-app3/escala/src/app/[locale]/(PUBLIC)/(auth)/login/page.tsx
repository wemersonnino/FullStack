import { LoginForm } from '@/components/auth/login/LoginForm';
import { Suspense } from 'react';

export const metadata = { title: 'Login | Plataforma Escala' };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
