import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { getMyProfile } from '@/services/profile.service';
import { sanitizeClientUser } from '@/lib/auth/client-user';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

export const metadata = {
  title: 'Meu perfil | Plataforma Escala',
};

export default async function ProfilePage() {
  const { session, accessToken } = await getRequiredServerAuth();

  let freshUser = session.user;
  try {
    const profile = await getMyProfile(accessToken);
    if (profile) {
      freshUser = { ...session.user, ...profile };
    }
  } catch (error) {
    console.error('Failed to fetch fresh profile', error);
  }

  return <ProfileForm user={sanitizeClientUser(freshUser)} />;
}
