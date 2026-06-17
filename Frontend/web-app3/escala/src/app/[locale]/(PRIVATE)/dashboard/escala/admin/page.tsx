import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getEscalas, getUsuariosEscala } from '@/core/adapters/escala.service';
import { EscalaAdminPage as EscalaAdminFeaturePage } from '@/features/escala/pages/EscalaAdminPage';

export default async function EscalaAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const canManageEscala = session.user.roles?.includes('ADMIN') || session.user.roles?.includes('MANAGER');
  if (!canManageEscala) {
    redirect('/dashboard/escala');
  }

  const hoje = new Date();
  const periodo = {
    inicio: format(startOfMonth(hoje), 'yyyy-MM-dd'),
    fim: format(endOfMonth(hoje), 'yyyy-MM-dd'),
  };
  const token = session.user.token;
  const [escalas, usuarios] = await Promise.all([
    getEscalas(periodo, { authToken: token }),
    getUsuariosEscala(undefined, { authToken: token }),
  ]);

  return <EscalaAdminFeaturePage user={session.user} escalas={escalas} usuarios={usuarios} />;
}
