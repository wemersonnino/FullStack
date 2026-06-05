import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ProfileForm } from '@/components/dashboard/ProfileForm';

export const metadata = {
  title: 'Meu perfil | Plataforma Escala',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <ProfileForm user={session.user} />;
}
