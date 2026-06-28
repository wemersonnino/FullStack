'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createEmployee } from '@/services/employee.service';
import { getProjects, getSectors, Project, Sector } from '@/services/organization.service';

const NONE_VALUE = 'none';

export default function NovoColaboradorPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);
  const [sectorId, setSectorId] = useState(NONE_VALUE);
  const [projectId, setProjectId] = useState(NONE_VALUE);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const [sectorsData, projectsData] = await Promise.all([
        getSectors(),
        getProjects(),
      ]);

      setSectors(sectorsData);
      setProjects(projectsData.filter((project) => project.active !== false));
    }

    loadOptions();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim()) {
      toast.error('Informe o nome do colaborador.');
      return;
    }

    if (!email.trim()) {
      toast.error('Informe o e-mail do colaborador.');
      return;
    }

    setIsSubmitting(true);
    try {
      const employee = await createEmployee({
        fullName: fullName.trim(),
        email: email.trim(),
        active,
        sectorId: sectorId === NONE_VALUE ? undefined : sectorId,
        projectId: projectId === NONE_VALUE ? undefined : projectId,
      });

      if (!employee) {
        toast.error('Nao foi possivel cadastrar o colaborador.');
        return;
      }

      toast.success('Colaborador cadastrado com sucesso.');
      router.push('/dashboard/escala/admin');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Button variant="ghost" asChild className="mb-6 gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Colaboradores</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastrar Colaborador</h1>
          <p className="text-muted-foreground">
            Depois de cadastrado, o colaborador fica disponivel para definicao de escalas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employee-name">Nome completo</Label>
              <Input
                id="employee-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ex.: Maria Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-email">E-mail</Label>
              <Input
                id="employee-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="maria@empresa.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Setor</Label>
              <Select value={sectorId} onValueChange={setSectorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Sem setor</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={String(sector.id)}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Projeto</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Sem projeto</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="employee-active">Colaborador ativo</Label>
              <p className="text-sm text-muted-foreground">Apenas colaboradores ativos aparecem para novas escalas.</p>
            </div>
            <Switch id="employee-active" checked={active} onCheckedChange={setActive} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" asChild>
              <Link href="/dashboard">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar colaborador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
