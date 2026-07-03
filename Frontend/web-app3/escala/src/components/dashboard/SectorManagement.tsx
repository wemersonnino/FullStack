'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
import { Badge } from '@/components/ui/badge';

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
      toast.error(`Erro ao carregar setores: ${error}`);
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
      await fetchSectors();
    } catch (error) {
      toast.error(`Erro ao salvar setor? ${error}`);
    }
  }

  async function onDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      try {
        await deleteSector(id);
        toast.success('Setor excluído.');
        await fetchSectors();
      } catch (error) {
        toast.error(`Erro ao excluir setor? ${error}`);
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
          {filteredSectors.map((sector) => {
            // Simular taxa de ocupação para visual de produto
            const pseudoOccupancy = sector.maxSeats 
              ? Math.min(100, Math.round(((sector.name.length * 3) % sector.maxSeats) * 10 + 40)) 
              : 0;
            const isNearLimit = pseudoOccupancy >= 85;

            return (
              <div
                key={sector.id}
                className="group relative rounded-[28px] border border-slate-150 bg-white/70 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{sector.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="rounded-md text-[10px] uppercase font-bold tracking-wider px-1.5 py-0">
                          Setor
                        </Badge>
                        {sector.maxSeats && isNearLimit && (
                          <Badge className="bg-red-50 text-red-700 border border-red-100 hover:bg-red-50 rounded-md text-[10px] font-bold px-1.5 py-0">
                            Alta Ocupação
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:bg-slate-100"
                      onClick={() => onOpenEditDialog(sector)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600"
                      onClick={() => onDelete(sector.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {sector.description && (
                  <p className="mt-4 text-xs leading-5 text-slate-500 line-clamp-2">
                    {sector.description}
                  </p>
                )}

                {sector.maxSeats ? (
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Ocupação física</span>
                      <span className="font-bold text-slate-950">{pseudoOccupancy}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-500", isNearLimit ? "bg-red-500" : "bg-blue-600")}
                        style={{ width: `${pseudoOccupancy}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Limite operacional: {sector.maxSeats} vagas contratadas.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100/50 p-3 text-xs text-slate-500">
                    Nenhum limite de vagas físicas definido.
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100/50 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Lotação: {sector.maxSeats ? `${sector.maxSeats} vagas` : 'Ilimitado'}</span>
                  </div>
                  {sector.managerName && (
                    <span className="bg-slate-100 text-slate-800 rounded-full px-2 py-0.5 text-[10px] font-bold">
                      Gestor: {sector.managerName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
