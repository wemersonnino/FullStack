import { getShifts, getWorkSchedules } from '@/services/shift.service';
import { ShiftSwapForm } from '@/components/dashboard/ShiftSwapForm';
import { WorkScheduleModal } from '@/components/dashboard/WorkScheduleModal';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, Building2, Compass, CalendarClock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { Badge } from '@/components/ui/badge';

export default async function TeamSlot() {
  const { session, accessToken } = await getRequiredServerAuth();

  const isAdmin = session.user.roles.includes('ADMIN') || session.user.roles.includes('OWNER');
  
  const [shifts, workSchedules] = await Promise.all([
    getShifts(accessToken),
    getWorkSchedules(accessToken),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge className="rounded-full bg-slate-950 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white hover:bg-slate-950">
              Perfil Operacional
            </Badge>
            <h3 className="text-xl font-black tracking-tight">{session.user.username}</h3>
            <p className="text-sm text-muted-foreground">
              Acesso ativo para acompanhar agenda, trocas e areas sob sua gestao.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Permissoes</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{session.user.roles.join(', ')}</p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Turnos pessoais</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{shifts.length} no periodo atual</p>
          </div>
        </div>
      </section>
      
      <section className="rounded-[28px] border border-blue-200/70 bg-[linear-gradient(135deg,#eef5ff_0%,#ffffff_100%)] p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-2 text-white">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-950">Acoes imediatas</h3>
            <p className="text-sm text-slate-600">Dispare trocas e consulte jornadas sem sair do cockpit.</p>
          </div>
        </div>
        <div className="grid gap-3">
          <ShiftSwapForm shifts={shifts} />
          <WorkScheduleModal schedules={workSchedules} />
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-[28px] border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-600 p-2 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Atalhos de gestao</h3>
              <p className="text-sm text-muted-foreground">Entradas rapidas para equipe, tenants e relatorios.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
              <Link href="/dashboard/empresas">
                <Building2 className="h-4 w-4" />
                Empresas
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
              <Link href="/dashboard/team">
                <Users className="h-4 w-4" />
                Equipe
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
              <Link href="/dashboard/relatorios">
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-[28px] border bg-slate-950 p-6 text-slate-50 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/10 p-2">
            <Compass className="h-4 w-4" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black tracking-tight">Leitura recomendada</h3>
            <p className="text-sm leading-6 text-slate-300">
              Comece pelo resumo do mes, trate trocas pendentes e so depois entre em setores, projetos e escalas
              detalhadas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
