'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Briefcase, Layers3, Mail, Plus, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Employee, getEmployees } from '@/services/employee.service';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';

export default function TeamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAdmin = session?.user?.roles?.includes('ADMIN');

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router, status]);

  useEffect(() => {
    async function loadEmployees() {
      setIsLoading(true);
      try {
        setEmployees(await getEmployees());
      } catch {
        toast.error('Erro ao carregar colaboradores.');
      } finally {
        setIsLoading(false);
      }
    }

    if (isAdmin) loadEmployees();
  }, [isAdmin]);

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase();
    return employees.filter((employee) => {
      return (
        employee.fullName?.toLowerCase().includes(term) ||
        employee.email?.toLowerCase().includes(term) ||
        employee.sector?.name?.toLowerCase().includes(term) ||
        employee.project?.name?.toLowerCase().includes(term)
      );
    });
  }, [employees, search]);
  const activeEmployees = employees.filter((employee) => employee.active).length;
  const withoutSector = employees.filter((employee) => !employee.sector?.name).length;
  const withoutProject = employees.filter((employee) => !employee.project?.name).length;

  return (
    <div className="container mx-auto space-y-8 py-8">
      <DashboardPageHeader
        eyebrow="Gestao de Equipe"
        title="Colaboradores, cobertura e lacunas de alocacao em uma leitura so."
        description="Use esta visao para acompanhar a base ativa, localizar pessoas sem setor ou projeto e decidir rapidamente onde abrir cadastro, convite ou redistribuicao."
        actions={
          <>
            <Button variant="outline" className="rounded-2xl" asChild>
              <Link href="/dashboard/team/invites">Gerenciar convites</Link>
            </Button>
            <Button asChild className="rounded-2xl gap-2">
              <Link href="/dashboard/colaboradores/novo">
                <Plus className="h-4 w-4" />
                Cadastrar colaborador
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Base total"
          value={employees.length}
          hint="Colaboradores carregados para este tenant."
          icon={Users}
          tone="blue"
        />
        <DashboardStatCard
          label="Ativos"
          value={activeEmployees}
          hint="Equipe apta para composicao de escala."
          icon={Users}
          tone="emerald"
        />
        <DashboardStatCard
          label="Sem setor"
          value={withoutSector}
          hint="Demandam organizacao estrutural."
          icon={Layers3}
          tone="amber"
        />
        <DashboardStatCard
          label="Sem projeto"
          value={withoutProject}
          hint="Podem gerar ociosidade ou alocacao ambigua."
          icon={Briefcase}
          tone="rose"
        />
      </div>

      <section className="rounded-[28px] border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Explorar equipe
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Painel de colaboradores</h2>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, email, setor ou projeto..."
              className="h-12 rounded-2xl pl-9"
            />
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-[28px] border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{employee.fullName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {employee.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{employee.sector?.name || 'Sem setor'}</TableCell>
                <TableCell>{employee.project?.name || 'Sem projeto'}</TableCell>
                <TableCell>
                  <Badge variant={employee.active ? 'secondary' : 'outline'}>
                    {employee.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && filteredEmployees.length === 0 && (
          <Empty className="border-none py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Nenhum colaborador encontrado</EmptyTitle>
              <EmptyDescription>
                Não há colaboradores cadastrados ou correspondentes à sua busca.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {isLoading && (
          <Loading text="Carregando colaboradores..." className="py-12" />
        )}
      </div>
    </div>
  );
}
