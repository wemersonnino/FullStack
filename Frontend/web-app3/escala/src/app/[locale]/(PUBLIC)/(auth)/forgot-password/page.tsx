import { ForgotPasswordForm } from '@/components/auth/forgotPassword/ForgotPasswordForm';
import { Suspense } from 'react';

export const metadata = { title: 'Recuperar Senha | Plataforma Escala' };

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
