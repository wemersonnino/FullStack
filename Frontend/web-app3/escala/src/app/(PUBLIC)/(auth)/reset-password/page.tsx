import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password/ResetPasswordForm';

export const metadata = {
  title: 'Redefinir Senha | Plataforma Escala',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
