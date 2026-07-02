import { AiAssistantPanel } from '@/features/ai/components/AiAssistantPanel';
import { AiAssistantTrigger } from '@/features/ai/components/AiAssistantTrigger';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { BrainCircuit, Radar, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const { session } = await getRequiredServerAuth();
  const roles = session.user.roles ?? [];
  const isManagerOrAdmin = roles.includes('ADMIN') || roles.includes('OWNER') || roles.some((role) => role.startsWith('MANAGER'));
  const primaryRole = roles[0] ?? 'MEMBRO';

  return (
    <div className="mx-auto mt-8 max-w-[1440px] space-y-8 px-4 pb-12 md:px-6">
      <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#f7f3eb_0%,#ffffff_44%,#edf5ff_100%)] shadow-sm">
        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-slate-950 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white hover:bg-slate-950">
                Centro de Comando
              </Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {session.user.companySlug}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl xl:text-5xl">
                Operacao mensal, cobertura e decisao em uma unica superficie.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Use o dashboard como cockpit da operacao: acompanhe alertas, trocas, agenda imediata e acessos
                administrativos sem perder contexto entre equipe, setores, projetos e escalas.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 inline-flex rounded-2xl bg-slate-950 p-2 text-white">
                <Radar className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Visibilidade</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                Resumo do mes, pendencias e ritmo da operacao na mesma leitura.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 inline-flex rounded-2xl bg-blue-600 p-2 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Acesso</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                Perfil atual: {primaryRole}. Navegacao privada adaptada ao seu escopo de decisao.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 inline-flex rounded-2xl bg-emerald-600 p-2 text-white">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Assistencia</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                Painel pensado para reduzir troca de contexto antes de entrar na escala inteligente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.92fr)]">
        {isManagerOrAdmin && (
          <div className="xl:col-span-2">
            {stats}
          </div>
        )}
        <div className="space-y-6">
          {content}
        </div>
        <div className="space-y-6">
          {team}
        </div>
      </div>

      {children}

      <AiAssistantPanel />
      <AiAssistantTrigger />
    </div>
  );
}
