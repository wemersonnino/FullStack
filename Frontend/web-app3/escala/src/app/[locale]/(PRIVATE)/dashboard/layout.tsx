import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  stats: React.ReactNode;
  content: React.ReactNode;
  team: React.ReactNode;
}

export default async function DashboardLayout({
  children,
  stats,
  content,
  team,
}: LayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="mx-auto mt-12 max-w-6xl space-y-10 px-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold italic tracking-tight">
          Dashboard <span className="text-primary">B2B</span>
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {session.user.companySlug}
          </span>
          <div className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Slot de Estatísticas - Ocupa a linha superior inteira */}
        <div className="md:col-span-4">
          {stats}
        </div>

        {/* Slot de Conteúdo Principal (Escalas/Lista) */}
        <div className="md:col-span-3">
          {content}
        </div>

        {/* Slot Lateral (Time/Info) */}
        <div className="md:col-span-1 space-y-6">
          {team}
        </div>
      </div>

      {/* O children original do dashboard pode ser usado para modais ou rotas aninhadas */}
      {children}
    </div>
  );
}
