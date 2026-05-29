import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getShifts, getWorkSchedules } from '@/services/shift.service';
import { ShiftSwapForm } from '@/components/dashboard/ShiftSwapForm';
import { WorkScheduleModal } from '@/components/dashboard/WorkScheduleModal';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, BarChart3, Building2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default async function TeamSlot() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) return null;

  const isAdmin = session.user.roles.includes('ADMIN') || session.user.roles.includes('OWNER');
  
  const [shifts, workSchedules] = await Promise.all([
    getShifts(session.user.token),
    getWorkSchedules(session.user.token),
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Perfil</h3>
          <ThemeToggle />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Usuário</span>
            <span className="font-medium">{session.user.username}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Permissão</span>
            <span className="font-medium text-primary">{session.user.roles.join(', ')}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-primary/5 space-y-4 rounded-xl border border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary">Ações Rápidas</h3>
        <div className="grid gap-3">
            <ShiftSwapForm shifts={shifts} />
            <WorkScheduleModal schedules={workSchedules} />
        </div>
      </div>

      {isAdmin && (
        <div className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Dashboard Admin</h3>
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
        </div>
      )}

      <div className="pt-4">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600">
             <LogOut className="h-4 w-4" />
             Encerrar Sessão
          </Button>
      </div>
    </div>
  );
}
