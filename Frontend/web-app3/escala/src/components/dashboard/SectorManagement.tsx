'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  getSectors, 
  createSector, 
  updateSector, 
  deleteSector,
  Sector 
} from '@/services/organization.service';

const SectorSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
  maxSeats: z.string().optional(),
});

type SectorFormValues = z.infer<typeof SectorSchema>;

export function SectorManagement() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  const form = useForm<SectorFormValues>({
    resolver: zodResolver(SectorSchema),
    defaultValues: {
      name: '',
      description: '',
      maxSeats: '',
    },
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  async function fetchSectors() {
    setIsLoading(true);
    try {
      const data = await getSectors();
      setSectors(data);
    } catch (error) {
      toast.error('Erro ao carregar setores.');
    } finally {
      setIsLoading(false);
    }
  }

  const onOpenAddDialog = () => {
    setEditingSector(null);
    form.reset({
      name: '',
      description: '',
      maxSeats: '',
    });
    setIsDialogOpen(true);
  };

  const onOpenEditDialog = (sector: Sector) => {
    setEditingSector(sector);
    form.reset({
      name: sector.name,
      description: sector.description || '',
      maxSeats: sector.maxSeats ? String(sector.maxSeats) : '',
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: any) {
    try {
      if (editingSector) {
        await updateSector(editingSector.id, values);
        toast.success('Setor atualizado com sucesso.');
      } else {
        await createSector(values);
        toast.success('Setor criado com sucesso.');
      }

      setIsDialogOpen(false);
      fetchSectors();
    } catch (error) {
      toast.error('Erro ao salvar setor.');
    }
  }

  async function onDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      try {
        await deleteSector(id);
        toast.success('Setor excluído.');
        fetchSectors();
      } catch (error) {
        toast.error('Erro ao excluir setor.');
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Setores</h2>
          <p className="text-muted-foreground">
            Gerencie os setores da organização para alocação de colaboradores.
          </p>
        </div>
        <Button onClick={onOpenAddDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Setor
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Carregando setores...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                    <Layers className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{sector.name}</h3>
                    {sector.maxSeats && (
                      <p className="text-xs text-muted-foreground">Vagas: {sector.maxSeats}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onOpenEditDialog(sector)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDelete(sector.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {sector.description && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                  {sector.description}
                </p>
              )}
            </div>
          ))}
          {sectors.length === 0 && (
            <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
              <Layers className="mb-2 h-8 w-8 opacity-20" />
              <p>Nenhum setor cadastrado.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSector ? 'Editar Setor' : 'Novo Setor'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do setor abaixo.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Setor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Operações, TI, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vagas Máximas (opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 10" {...field} />
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
                      <Textarea placeholder="Breve descrição do setor" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
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
