'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, CalendarDays, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { OperationalCapacityService } from '@/core/application/services/operationalCapacity.service';
import { OrganizationService } from '@/core/application/services/organization.service';
import { WorkPostService } from '@/core/application/services/workPost.service';
import { Sector } from '@/services/organization.service';
import { WorkPostModel } from '@/infrastructure/adapters/workPost.adapter';
import { OperationalCapacityModel } from '@/infrastructure/adapters/operationalCapacity.adapter';

const CapacitySchema = z.object({
  targetType: z.enum(['SECTOR', 'WORK_POST']),
  targetId: z.string().min(1, 'Selecione um alvo.'),
  dayOfWeek: z.string().min(1, 'Selecione o dia da semana.'),
  startTime: z.string().min(4, 'Horário inicial obrigatório.'),
  endTime: z.string().min(4, 'Horário final obrigatório.'),
  minEmployeesRequired: z.coerce.number().min(1, 'Mínimo de 1 colaborador.'),
});

type CapacityFormValues = z.infer<typeof CapacitySchema>;

const DAYS_OF_WEEK = [
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
  { value: '7', label: 'Domingo' },
];

export function OperationalCapacityForm() {
  const [capacities, setCapacities] = useState<OperationalCapacityModel[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [workPosts, setWorkPosts] = useState<WorkPostModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(CapacitySchema) as any,
    defaultValues: {
      targetType: 'SECTOR',
      targetId: '',
      dayOfWeek: '1',
      startTime: '08:00',
      endTime: '18:00',
      minEmployeesRequired: 1,
    },
  });

  const selectedTargetType = form.watch('targetType');

  useEffect(() => {
    fetchCapacities();
    fetchSectorsAndWorkPosts();
  }, []);

  async function fetchCapacities() {
    setIsLoading(true);
    try {
      const data = await OperationalCapacityService.listCapacities();
      setCapacities(data);
    } catch (error) {
      toast.error('Erro ao carregar capacidades operacionais.');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSectorsAndWorkPosts() {
    try {
      const sectorData = await OrganizationService.listSectors();
      setSectors(sectorData as any);
      const postData = await WorkPostService.list();
      setWorkPosts(postData);
    } catch (error) {
      console.error('Error fetching sectors/workposts:', error);
    }
  }

  const onOpenAddDialog = () => {
    form.reset({
      targetType: 'SECTOR',
      targetId: '',
      dayOfWeek: '1',
      startTime: '08:00',
      endTime: '18:00',
      minEmployeesRequired: 1,
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: CapacityFormValues) {
    try {
      const payload: OperationalCapacityModel = {
        targetId: values.targetId,
        targetType: values.targetType,
        dayOfWeek: parseInt(values.dayOfWeek),
        startTime: values.startTime + (values.startTime.length === 5 ? ":00" : ""),
        endTime: values.endTime + (values.endTime.length === 5 ? ":00" : ""),
        minEmployeesRequired: values.minEmployeesRequired,
      };
      await OperationalCapacityService.createCapacity(payload);
      toast.success('Regra de capacidade criada com sucesso.');
      setIsDialogOpen(false);
      fetchCapacities();
    } catch (error) {
      toast.error('Erro ao salvar capacidade operacional.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta regra de capacidade?')) return;
    try {
      await OperationalCapacityService.deleteCapacity(id);
      toast.success('Regra excluída.');
      fetchCapacities();
    } catch (error) {
      toast.error('Erro ao excluir regra.');
    }
  }

  const getTargetName = (cap: OperationalCapacityModel) => {
    if (cap.targetType === 'SECTOR') {
      const sec = sectors.find(s => s.id?.toString() === cap.targetId?.toString());
      return sec ? `Setor: ${sec.name}` : `Setor (ID: ${cap.targetId})`;
    } else {
      const wp = workPosts.find(w => w.id?.toString() === cap.targetId?.toString());
      return wp ? `Posto: ${wp.name}` : `Posto de Trabalho (ID: ${cap.targetId})`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Capacidades Operacionais Mínimas</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure o número mínimo de funcionários necessários por horário e dia.</p>
        </div>
        <Button onClick={onOpenAddDialog} className="rounded-xl flex items-center gap-1.5 font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-md transition-all">
          <Plus className="size-4" /> Nova Regra
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : capacities.length === 0 ? (
        <Card className="border border-dashed border-border/80 rounded-2xl bg-muted/10 p-8 text-center flex flex-col items-center justify-center">
          <Users className="size-10 text-muted-foreground/60 mb-2 stroke-[1.5]" />
          <p className="text-sm font-bold text-foreground">Nenhuma regra de capacidade cadastrada</p>
          <p className="text-xs text-muted-foreground mt-1">Defina metas de cobertura para alertar ou impedir escalas vazias.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capacities.map((cap) => {
            const dayLabel = DAYS_OF_WEEK.find(d => d.value === cap.dayOfWeek?.toString())?.label || 'Desconhecido';
            return (
              <Card key={cap.id} className="border border-border/60 rounded-2xl hover:shadow-lg transition-all hover:border-border/100 overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <span className="text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {cap.targetType}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-red-50 hover:text-red-500 text-muted-foreground"
                    onClick={() => cap.id && handleDelete(cap.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <h3 className="font-bold text-sm text-foreground truncate">{getTargetName(cap)}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    <span>{dayLabel} • {cap.startTime.slice(0,5)} - {cap.endTime.slice(0,5)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                    <Users className="size-3.5" />
                    <span className="text-foreground">Exige no mínimo {cap.minEmployeesRequired} colaborador(es)</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border border-border/80 bg-background/95 backdrop-blur-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold tracking-tight">Criar Regra de Capacidade</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Defina as regras de capacidade mínima exigida.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control as any}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">Tipo de Alvo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/80">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="SECTOR" className="rounded-lg">Setor</SelectItem>
                        <SelectItem value="WORK_POST" className="rounded-lg">Posto de Trabalho</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">Selecione o Alvo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/80">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {selectedTargetType === 'SECTOR'
                          ? sectors.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()} className="rounded-lg">
                                {s.name}
                              </SelectItem>
                            ))
                          : workPosts.map((wp) => (
                              <SelectItem key={wp.id} value={wp.id || ""} className="rounded-lg">
                                {wp.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">Dia da Semana *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/80">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {DAYS_OF_WEEK.map((d) => (
                          <SelectItem key={d.value} value={d.value} className="rounded-lg">
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-foreground">Hora Início *</FormLabel>
                      <FormControl>
                        <Input type="time" className="rounded-xl border-border/80" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-foreground">Hora Fim *</FormLabel>
                      <FormControl>
                        <Input type="time" className="rounded-xl border-border/80" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="minEmployeesRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">Mínimo de Colaboradores Exigidos *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" className="rounded-xl border-border/80" {...field} />
                    </FormControl>
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
