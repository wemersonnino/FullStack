'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { WorkPostService } from '@/core/application/services/workPost.service';
import { OrganizationService } from '@/core/application/services/organization.service';
import { Project } from '@/core/domain/models/organization.model';
import { WorkPostModel } from '@/infrastructure/adapters/workPost.adapter';

const WorkPostSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
  projectId: z.string().optional(),
});

type WorkPostFormValues = z.infer<typeof WorkPostSchema>;

export function WorkPostManagement() {
  const [workPosts, setWorkPosts] = useState<WorkPostModel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<WorkPostFormValues>({
    resolver: zodResolver(WorkPostSchema),
    defaultValues: {
      name: '',
      description: '',
      projectId: '',
    },
  });

  useEffect(() => {
    fetchWorkPosts();
    fetchProjects();
  }, []);

  async function fetchWorkPosts() {
    setIsLoading(true);
    try {
      const data = await WorkPostService.list();
      setWorkPosts(data);
    } catch (error) {
      toast.error('Erro ao carregar postos de trabalho.');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const data = await OrganizationService.listProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }

  const onOpenAddDialog = () => {
    form.reset({
      name: '',
      description: '',
      projectId: '',
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: WorkPostFormValues) {
    try {
      await WorkPostService.create(values);
      toast.success('Posto de trabalho criado com sucesso.');
      setIsDialogOpen(false);
      fetchWorkPosts();
    } catch (error) {
      toast.error('Erro ao salvar posto de trabalho (verifique os limites do seu plano).');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este posto de trabalho?')) return;
    try {
      await WorkPostService.delete(id);
      toast.success('Posto de trabalho excluído.');
      fetchWorkPosts();
    } catch (error) {
      toast.error('Erro ao excluir posto de trabalho.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Postos de Trabalho</h2>
          <p className="text-xs text-muted-foreground mt-1">Gerencie a alocação de postos vinculados a projetos e contratos.</p>
        </div>
        <Button onClick={onOpenAddDialog} className="rounded-xl flex items-center gap-1.5 font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-md transition-all">
          <Plus className="size-4" /> Novo Posto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : workPosts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Award />
            </EmptyMedia>
            <EmptyTitle>Nenhum posto de trabalho cadastrado</EmptyTitle>
            <EmptyDescription>
              Crie postos para segmentar os locais físicos de cobertura de escalas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workPosts.map((wp) => {
            const project = projects.find((p) => p.id === wp.projectId);
            return (
              <Card key={wp.id} className="border border-border/60 rounded-2xl hover:shadow-lg transition-all hover:border-border/100 overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold truncate max-w-[200px]">{wp.name}</CardTitle>
                    {project && (
                      <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                        {project.name}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-red-50 hover:text-red-500 text-muted-foreground"
                    onClick={() => wp.id && handleDelete(wp.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {wp.description || 'Sem descrição cadastrada.'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border border-border/80 bg-background/95 backdrop-blur-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold tracking-tight">Criar Posto de Trabalho</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Insira os detalhes do novo posto de trabalho.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">Nome do Posto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Recepção Central" className="rounded-xl border-border/80 focus:border-primary" {...field} />
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
                    <FormLabel className="text-xs font-bold text-foreground">Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva os requisitos ou detalhes deste posto" className="rounded-xl border-border/80 min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">Projeto Associado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/80">
                          <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="rounded-lg">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground">
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
