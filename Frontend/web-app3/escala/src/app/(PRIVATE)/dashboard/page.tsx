import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';
import { getShiftSwaps, getShifts, getWorkSchedules } from '@/services/shift.service';

export const metadata = {
  title: 'Dashboard | Plataforma Escala',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const [shifts, workSchedules, shiftSwaps] = await Promise.all([
    getShifts(session.user.token),
    getWorkSchedules(session.user.token),
    getShiftSwaps(session.user.token),
  ]);

  return (
    <DashboardClient
      user={session.user}
      shifts={shifts}
      workSchedules={workSchedules}
      shiftSwaps={shiftSwaps}
    />
  );
}
