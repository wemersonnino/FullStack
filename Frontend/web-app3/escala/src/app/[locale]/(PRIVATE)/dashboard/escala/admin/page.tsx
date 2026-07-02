import { redirect } from 'next/navigation';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { getEscalas, getUsuariosEscala } from '@/core/adapters/escala.service';
import { EscalaAdminPage as EscalaAdminFeaturePage } from '@/features/escala/pages/EscalaAdminPage';
import { sanitizeClientUser } from '@/lib/auth/client-user';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

export default async function EscalaAdminPage() {
  const { session, accessToken } = await getRequiredServerAuth();

  const canManageEscala = session.user.roles?.includes('ADMIN') || session.user.roles?.includes('MANAGER');
  if (!canManageEscala) {
    redirect('/dashboard/escala');
  }

  const hoje = new Date();
  const periodo = {
    inicio: format(startOfMonth(hoje), 'yyyy-MM-dd'),
    fim: format(endOfMonth(hoje), 'yyyy-MM-dd'),
  };
  const [escalas, usuarios] = await Promise.all([
    getEscalas(periodo, { authToken: accessToken }),
    getUsuariosEscala(undefined, { authToken: accessToken }),
  ]);

  return <EscalaAdminFeaturePage user={sanitizeClientUser(session.user)} escalas={escalas} usuarios={usuarios} />;
}
