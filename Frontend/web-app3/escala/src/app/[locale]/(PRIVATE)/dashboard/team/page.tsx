'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Mail, Plus, Search, Users } from 'lucide-react';
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

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Team</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground">Lista de colaboradores gerenciados pelo administrador.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/colaboradores/novo">
            <Plus className="h-4 w-4" />
            Cadastrar colaborador
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar colaborador..."
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
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
