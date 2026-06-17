import { RegisterForm } from '@/components/auth/register/RegisterForm';
import { Suspense } from 'react';

export const metadata = { title: 'Registrar | Plataforma Escala' };

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
