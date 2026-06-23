import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { getMyProfile } from '@/services/profile.service';

export const metadata = {
  title: 'Meu perfil | Plataforma Escala',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  let freshUser = session.user;
  try {
    const profile = await getMyProfile(session.user.token);
    if (profile) {
      freshUser = { ...session.user, ...profile };
    }
  } catch (error) {
    console.error('Failed to fetch fresh profile', error);
  }

  return <ProfileForm user={freshUser} />;
}
