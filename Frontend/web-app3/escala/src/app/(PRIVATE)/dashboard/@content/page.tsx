import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getShifts, getShiftSwaps } from '@/services/shift.service';
import { ShiftList } from '@/components/dashboard/ShiftList';
import { AdminSwapManagement } from '@/components/dashboard/AdminSwapManagement';

export default async function ContentSlot() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) return null;

  const isAdmin = session.user.roles.includes('ADMIN') || session.user.roles.includes('OWNER');

  const [shifts, shiftSwaps] = await Promise.all([
    getShifts(session.user.token),
    getShiftSwaps(session.user.token),
  ]);

  return (
    <div className="space-y-10">
      {isAdmin && (
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 shadow-inner">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Gestão de Trocas</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase">
              Admin Mode
            </span>
          </div>
          <AdminSwapManagement swaps={shiftSwaps} />
        </div>
      )}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold">Minhas Escalas</h2>
        <ShiftList shifts={shifts} />
      </div>
    </div>
  );
}
