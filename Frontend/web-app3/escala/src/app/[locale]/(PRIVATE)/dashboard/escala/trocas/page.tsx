import { getShifts, getShiftSwaps } from '@/services/shift.service';
import { TrocasTurnoView } from '@/features/escala/components/TrocasTurnoView';
import { canManageEscala } from '@/core/domain/escala/escala.permissions';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

export default async function TrocasPage() {
  const { session, accessToken } = await getRequiredServerAuth();

  const [trocas, shifts] = await Promise.all([
    getShiftSwaps(accessToken),
    getShifts(accessToken),
  ]);

  return <TrocasTurnoView trocas={trocas} shifts={shifts} canManage={canManageEscala(session.user)} />;
}
