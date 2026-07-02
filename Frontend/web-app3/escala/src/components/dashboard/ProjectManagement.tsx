'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Briefcase, Search, PauseCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  Project 
} from '@/services/organization.service';

const ProjectSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
  active: z.boolean(),
});

type ProjectFormValues = z.infer<typeof ProjectSchema>;

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
    },
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const term = search.toLowerCase();
    return projects.filter((project) => {
      return (
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term)
      );
    });
  }, [projects, search]);
  const activeProjects = projects.filter((project) => project.active).length;
  const describedProjects = projects.filter((project) => Boolean(project.description)).length;

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      toast.error('Erro ao carregar projetos.');
    } finally {
      setIsLoading(false);
    }
  }

  const onOpenAddDialog = () => {
    setEditingProject(null);
    form.reset({
      name: '',
      description: '',
      active: true,
    });
    setIsDialogOpen(true);
  };

  const onOpenEditDialog = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      description: project.description || '',
      active: project.active,
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: ProjectFormValues) {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, values);
        toast.success('Projeto atualizado com sucesso.');
      } else {
        await createProject(values);
        toast.success('Projeto criado com sucesso.');
      }

      setIsDialogOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error('Erro ao salvar projeto.');
    }
  }

  async function onDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteProject(id);
        toast.success('Projeto excluído.');
        fetchProjects();
      } catch (error) {
        toast.error('Erro ao excluir projeto.');
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Carteira de entrega
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Projetos e frentes de alocacao</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Mantenha a carteira ativa enxuta e legivel para evitar colaborador sem contexto de lotacao.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Projetos</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{projects.length}</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Ativos</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{activeProjects}</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Com descricao</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{describedProjects}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 xl:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar projeto por nome ou descricao..."
                className="h-12 rounded-2xl pl-9"
              />
            </div>
            <Button onClick={onOpenAddDialog} className="h-12 rounded-2xl gap-2">
              <Plus className="h-4 w-4" /> Novo Projeto
            </Button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Loading text="Carregando projetos..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-[28px] border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${project.active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-muted-foreground">
                        {project.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onOpenEditDialog(project)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {project.description && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {project.active ? (
                  <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <PauseCircle className="h-3.5 w-3.5 text-rose-600" />
                )}
                <span>{project.active ? 'Frente apta para novas alocacoes' : 'Frente retirada de novas composicoes'}</span>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Briefcase />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum projeto cadastrado</EmptyTitle>
                  <EmptyDescription>
                    Adicione um projeto para começar a gerenciar alocações de colaboradores.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do projeto abaixo.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Projeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: App Mobile, Site Institucional, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Breve descrição do projeto" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Projeto Ativo</FormLabel>
                      <FormDescription>
                        Projetos inativos não aparecem nas novas escalas.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting} isLoading={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
