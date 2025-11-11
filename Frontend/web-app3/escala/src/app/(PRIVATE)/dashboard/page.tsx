import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // importa o mesmo NextAuth config
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Plataforma Escala',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // se não estiver logado, redireciona para login
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="p-6">
      <DashboardClient user={session.user} />
    </div>
  );
}
