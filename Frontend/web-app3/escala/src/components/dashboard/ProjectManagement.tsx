'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  async function onDelete(id: number) {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projetos</h2>
          <p className="text-muted-foreground">
            Gerencie os projetos onde os colaboradores serão alocados.
          </p>
        </div>
        <Button onClick={onOpenAddDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Carregando projetos...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
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
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
              <Briefcase className="mb-2 h-8 w-8 opacity-20" />
              <p>Nenhum projeto cadastrado.</p>
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
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
