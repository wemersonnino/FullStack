'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { Shift } from '@/interfaces/shift/shift.interface';
import { WorkSchedule } from '@/interfaces/shift/work-schedule.interface';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { ShiftList } from './ShiftList';
import { ShiftSwapForm } from './ShiftSwapForm';
import { WorkScheduleModal } from './WorkScheduleModal';
import { AdminSwapManagement } from './AdminSwapManagement';
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  BarChart3, 
  Building2 
} from 'lucide-react';
import Link from 'next/link';

interface DashboardClientProps {
  user: {
    id: string | number;
    username: string;
    email: string;
    roles: string[];
    theme?: ThemeEnum;
  };
  shifts: Shift[];
  workSchedules: WorkSchedule[];
  shiftSwaps: ShiftSwap[];
}

export const DashboardClient = ({ user, shifts, workSchedules, shiftSwaps }: DashboardClientProps) => {
  const { logout } = useAuth();
  const isAdmin = user.roles.includes('ADMIN');

  return (
    <section className="mx-auto mt-12 max-w-4xl space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bem-vindo, {user.username} 👋</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="destructive" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-10">
          {isAdmin && (
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
              <AdminSwapManagement swaps={shiftSwaps} />
            </div>
          )}
          <ShiftList shifts={shifts} />
        </div>

        <div className="space-y-6">
          <div className="bg-card space-y-4 rounded-xl border p-6">
            <h3 className="text-lg font-semibold">Suas Informações</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="text-muted-foreground font-medium">Cargo/Role:</span> {user.roles.join(', ') || 'Funcionário'}
              </p>
              <p>
                <span className="text-muted-foreground font-medium">Preferência de Tema:</span> {user.theme}
              </p>
            </div>
          </div>
          
          <div className="bg-primary/5 space-y-4 rounded-xl border border-primary/20 p-6">
            <h3 className="text-lg font-semibold text-primary">Ações Rápidas</h3>
            <ShiftSwapForm shifts={shifts} />
            <WorkScheduleModal schedules={workSchedules} />
          </div>

          {isAdmin && (
            <div className="bg-card space-y-4 rounded-xl border p-6">
              <h3 className="text-lg font-semibold">Gerenciamento</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/dashboard/empresas">
                    <Building2 className="h-4 w-4" />
                    Gerenciar Empresas
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/dashboard/colaboradores/novo">
                    <Users className="h-4 w-4" />
                    Cadastrar Colaborador
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/dashboard/projetos/novo">
                    <Briefcase className="h-4 w-4" />
                    Cadastrar Projeto
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/dashboard/relatorios">
                    <BarChart3 className="h-4 w-4" />
                    Visualizar Relatórios
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Projetos Ativos</h3>
            <ul role="list" className="grid grid-cols-1 gap-4">
              {[
                { name: 'Core Banking', initials: 'CB', bgColor: 'bg-pink-600' },
                { name: 'Plataforma Escala', initials: 'PE', bgColor: 'bg-purple-600' },
              ].map((project) => (
                <li key={project.name} className="flex rounded-md shadow-sm">
                  <div className={cn(
                    project.bgColor,
                    "flex w-12 shrink-0 items-center justify-center rounded-l-md text-xs font-bold text-white"
                  )}>
                    {project.initials}
                  </div>
                  <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t bg-card px-4 py-2">
                    <div className="flex-1 truncate">
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">Ativo</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
