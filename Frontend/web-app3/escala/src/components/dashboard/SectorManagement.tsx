'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Layers, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
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
  const [search, setSearch] = useState('');

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

  const filteredSectors = useMemo(() => {
    const term = search.toLowerCase();
    return sectors.filter((sector) => {
      return (
        sector.name.toLowerCase().includes(term) ||
        sector.description?.toLowerCase().includes(term)
      );
    });
  }, [search, sectors]);
  const totalSeats = sectors.reduce((sum, sector) => sum + (sector.maxSeats ?? 0), 0);
  const describedSectors = sectors.filter((sector) => Boolean(sector.description)).length;

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

  async function onSubmit(values: SectorFormValues) {
    const payload = {
      ...values,
      maxSeats: values.maxSeats ? Number(values.maxSeats) : null,
    };

    try {
      if (editingSector) {
        await updateSector(editingSector.id, payload);
        toast.success('Setor atualizado com sucesso.');
      } else {
        await createSector(payload);
        toast.success('Setor criado com sucesso.');
      }

      setIsDialogOpen(false);
      fetchSectors();
    } catch (error) {
      toast.error('Erro ao salvar setor.');
    }
  }

  async function onDelete(id: string) {
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
      <section className="rounded-[28px] border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Estrutura base
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Setores organizacionais</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Defina as unidades que concentram pessoas, cobertura minima e limites de ocupacao.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Setores</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{sectors.length}</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Capacidade total</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{totalSeats}</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Com descricao</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{describedSectors}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 xl:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar setor por nome ou descricao..."
                className="h-12 rounded-2xl pl-9"
              />
            </div>
            <Button onClick={onOpenAddDialog} className="h-12 rounded-2xl gap-2">
              <Plus className="h-4 w-4" /> Novo Setor
            </Button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Loading text="Carregando setores..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSectors.map((sector) => (
            <div
              key={sector.id}
              className="group relative rounded-[28px] border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted">
                    <Layers className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{sector.name}</h3>
                    {sector.maxSeats && (
                      <p className="text-xs text-muted-foreground">Vagas: {sector.maxSeats}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
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
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{sector.maxSeats ? `${sector.maxSeats} vagas configuradas` : 'Capacidade ainda nao definida'}</span>
              </div>
            </div>
          ))}
          {filteredSectors.length === 0 && (
            <div className="col-span-full">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Layers />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum setor cadastrado</EmptyTitle>
                  <EmptyDescription>
                    Adicione um setor para começar a organizar as escalas de trabalho.
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
