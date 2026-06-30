import { SettingsForm } from '@/components/dashboard/SettingsForm';
import { sanitizeClientUser } from '@/lib/auth/client-user';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

export const metadata = {
  title: 'Configurações | Plataforma Escala',
};

export default async function SettingsPage() {
  const { session } = await getRequiredServerAuth();

  // Permissão de administrador ou owner
  const isAdmin =
    session.user.roles?.includes('ADMIN') ||
    session.user.roles?.includes('OWNER') ||
    false;

  return <SettingsForm user={sanitizeClientUser(session.user)} isAdmin={isAdmin} />;
}
