import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getEscalas, getMinhasEscalas } from '@/core/services/escala.service';
import { EscalaPage as EscalaFeaturePage } from '@/features/escala/pages/EscalaPage';

export default async function EscalaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const hoje = new Date();
  const periodo = {
    inicio: format(startOfMonth(hoje), 'yyyy-MM-dd'),
    fim: format(endOfMonth(hoje), 'yyyy-MM-dd'),
  };
  const token = session.user.token;
  const canViewAllEscalas = session.user.roles?.includes('ADMIN') || session.user.roles?.includes('MANAGER');
  const escalas = canViewAllEscalas
    ? await getEscalas(periodo, { authToken: token })
    : await getMinhasEscalas(periodo, { authToken: token });

  return <EscalaFeaturePage user={session.user} escalas={escalas} />;
}
