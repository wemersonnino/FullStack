import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getShifts, getShiftSwaps } from '@/services/shift.service';
import { TrocasTurnoView } from '@/features/escala/components/TrocasTurnoView';
import { canManageEscala } from '@/core/domain/escala/escala.permissions';

export default async function TrocasPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) redirect('/login');

  const [trocas, shifts] = await Promise.all([
    getShiftSwaps(session.user.token),
    getShifts(session.user.token),
  ]);

  return <TrocasTurnoView trocas={trocas} shifts={shifts} canManage={canManageEscala(session.user)} />;
}
