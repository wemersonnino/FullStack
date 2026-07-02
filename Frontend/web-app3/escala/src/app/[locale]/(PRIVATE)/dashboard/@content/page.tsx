import { getShifts, getShiftSwaps } from '@/services/shift.service';
import { ShiftList } from '@/components/dashboard/ShiftList';
import { AdminSwapManagement } from '@/components/dashboard/AdminSwapManagement';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { Badge } from '@/components/ui/badge';

export default async function ContentSlot() {
  const { session, accessToken } = await getRequiredServerAuth();

  const isAdmin = session.user.roles.includes('ADMIN') || session.user.roles.includes('OWNER');

  const [shifts, shiftSwaps] = await Promise.all([
    getShifts(accessToken),
    getShiftSwaps(accessToken),
  ]);
  const pendingAdminSwaps = shiftSwaps.filter(
    (swap) => swap.status === 'pending' || swap.status === 'colleague_approved'
  );

  return (
    <div className="space-y-6">
      {isAdmin && (
        <section className="rounded-[30px] border border-amber-200/80 bg-[linear-gradient(135deg,#fff7e8_0%,#ffffff_100%)] p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
                Aprovacao operacional
              </p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Trocas que pedem decisao
              </h2>
            </div>
            <Badge className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-950 hover:bg-amber-500">
              {pendingAdminSwaps.length} pendentes
            </Badge>
          </div>
          <AdminSwapManagement swaps={shiftSwaps} />
        </section>
      )}

      <section className="rounded-[30px] border bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Agenda imediata
            </p>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Turnos e cobertura do periodo
            </h2>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
            {shifts.length} turnos carregados
          </Badge>
        </div>
        <ShiftList shifts={shifts} showHeader={false} />
      </section>
    </div>
  );
}
