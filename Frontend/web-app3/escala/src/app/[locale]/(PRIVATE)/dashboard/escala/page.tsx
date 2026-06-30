import { endOfMonth, format, startOfMonth } from 'date-fns';
import { getEscalas, getMinhasEscalas, getUsuariosEscala } from '@/core/adapters/escala.service';
import { EscalaPage as EscalaFeaturePage } from '@/features/escala/pages/EscalaPage';
import { sanitizeClientUser } from '@/lib/auth/client-user';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

export default async function EscalaPage() {
  const { session, accessToken } = await getRequiredServerAuth();

  const hoje = new Date();
  const periodo = {
    inicio: format(startOfMonth(hoje), 'yyyy-MM-dd'),
    fim: format(endOfMonth(hoje), 'yyyy-MM-dd'),
  };
  const roles = session.user.roles ?? [];
  const canViewAllEscalas = roles.includes('ADMIN') || roles.includes('OWNER') || roles.some((role) => role.startsWith('MANAGER'));
  const escalas = canViewAllEscalas
    ? await getEscalas(periodo, { authToken: accessToken })
    : await getMinhasEscalas(periodo, { authToken: accessToken });
  const usuarios = canViewAllEscalas ? await getUsuariosEscala(undefined, { authToken: accessToken }) : [];

  return <EscalaFeaturePage user={sanitizeClientUser(session.user)} escalas={escalas} usuarios={usuarios} />;
}
