import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SettingsForm } from '@/components/dashboard/SettingsForm';

export const metadata = {
  title: 'Configurações | Plataforma Escala',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Permissão de administrador ou owner
  const isAdmin =
    session.user.roles?.includes('ADMIN') ||
    session.user.roles?.includes('OWNER') ||
    false;

  return <SettingsForm user={session.user} isAdmin={isAdmin} />;
}
