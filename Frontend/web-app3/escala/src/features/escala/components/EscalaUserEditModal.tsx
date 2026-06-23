'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  Save,
  Plus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UsuarioEscala as LegacyUsuarioEscala, EscalaRequest } from '@/interfaces/escala/escala.interface';
import {
  CriarEscalaPayload,
  Escala as DomainEscala,
  UsuarioEscala as DomainUsuarioEscala,
} from '@/core/domain/escala/escala.types';
import { createEscalas } from '@/services/escala.service';
import { createSector, getProjects, getSectors, Project, Sector } from '@/services/organization.service';

const EscalaSchema = z.object({
  usuarioId: z.string().optional(),
  dates: z.array(z.date()).min(1, 'Selecione pelo menos um dia.'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido.'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido.'),
  workMode: z.enum(['PRESENCIAL', 'REMOTO']),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  sectorId: z.string().optional(),
});

type EscalaFormValues = z.infer<typeof EscalaSchema>;

type ModalUsuarioEscala = LegacyUsuarioEscala | DomainUsuarioEscala;

type LegacyEscalaUserEditModalProps = {
  user: LegacyUsuarioEscala | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type ManagedEscalaUserEditModalProps = {
  open: boolean;
  usuario: DomainUsuarioEscala | null;
  usuarios: DomainUsuarioEscala[];
  escala: DomainEscala | null;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CriarEscalaPayload, escalaId?: string) => Promise<void>;
};

type EscalaUserEditModalProps = LegacyEscalaUserEditModalProps | ManagedEscalaUserEditModalProps;

export function EscalaUserEditModal(props: EscalaUserEditModalProps) {
  const isManaged = 'open' in props;
  const user: ModalUsuarioEscala | null = isManaged ? props.usuario : props.user;
  const isOpen = isManaged ? props.open : props.isOpen;
  const usuarios = isManaged ? props.usuarios : [];
  const escala = isManaged ? props.escala : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [newSectorName, setNewSectorName] = useState('');
  const [isCreatingSector, setIsCreatingSector] = useState(false);
  const [showNewSectorInput, setShowNewSectorInput] = useState(false);

  const form = useForm<EscalaFormValues>({
    resolver: zodResolver(EscalaSchema),
    defaultValues: {
      usuarioId: undefined,
      dates: [],
      startTime: '08:00',
      endTime: '17:00',
      workMode: 'PRESENCIAL',
      notes: '',
    },
  });

  function closeModal() {
    if (isManaged) {
      props.onOpenChange(false);
      return;
    }

    props.onClose();
  }

  useEffect(() => {
    if (!isOpen) return;

    async function loadOrganizationData() {
      const [projectsData, sectorsData] = await Promise.all([
        getProjects(),
        getSectors(),
      ]);

      setProjects(projectsData.filter((project) => project.active !== false));
      setSectors(sectorsData);
    }

    loadOrganizationData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const selectedUserId = user?.id ? String(user.id) : escala?.usuarioId ? String(escala.usuarioId) : undefined;
    const selectedUser = selectedUserId
      ? (user ?? usuarios.find((item) => String(item.id) === selectedUserId) ?? null)
      : user;
    const escalaDate = escala?.dataInicio ? new Date(escala.dataInicio) : null;

    form.reset({
      usuarioId: selectedUserId,
      dates: escalaDate && !Number.isNaN(escalaDate.getTime()) ? [escalaDate] : [],
      startTime: escala?.horarioInicio ?? '08:00',
      endTime: escala?.horarioFim ?? '17:00',
      workMode: escala?.remoto ? 'REMOTO' : 'PRESENCIAL',
      notes: escala?.observacao ?? '',
      projectId: escala?.projetoId ? String(escala.projetoId) : selectedUser?.projetoId ? String(selectedUser.projetoId) : undefined,
      sectorId: escala?.setorId ? String(escala.setorId) : selectedUser?.setorId ? String(selectedUser.setorId) : undefined,
    });
  }, [escala, form, isOpen, user, usuarios]);

  async function onSubmit(values: EscalaFormValues) {
    const selectedUser = user ?? usuarios.find((item) => String(item.id) === values.usuarioId) ?? null;

    if (!selectedUser) {
      toast.error('Selecione um colaborador para criar a escala.');
      return;
    }

    const selectedProjectId = values.projectId ?? (selectedUser.projetoId ? String(selectedUser.projetoId) : undefined);
    const selectedSectorId = values.sectorId ?? (selectedUser.setorId ? String(selectedUser.setorId) : undefined);

    if (!selectedProjectId && !selectedSectorId) {
      toast.error('Informe um setor para este colaborador antes de criar a escala.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isManaged) {
        const payload: CriarEscalaPayload = {
          usuarioId: String(selectedUser.id),
          datas: values.dates.map((date) => format(date, 'yyyy-MM-dd')),
          horarioInicio: values.startTime,
          horarioFim: values.endTime,
          remoto: values.workMode === 'REMOTO',
          observacao: values.notes,
          projetoId: selectedProjectId,
          setorId: selectedSectorId,
          version: escala?.version,
        };

        await props.onSave(payload, escala?.id);
      } else {
        const payload: EscalaRequest = {
          employeeId: Number(selectedUser.id),
          dates: values.dates.map((date) => format(date, 'yyyy-MM-dd')),
          startTime: values.startTime,
          endTime: values.endTime,
          workMode: values.workMode,
          notes: values.notes,
          projectId: selectedProjectId ? Number(selectedProjectId) : undefined,
          sectorId: selectedSectorId ? Number(selectedSectorId) : undefined,
        };

        await createEscalas(payload);
        props.onSuccess();
      }

      toast.success('Escala(s) criada(s) com sucesso.');
      closeModal();
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar escala.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateSector() {
    if (!newSectorName.trim()) {
      toast.error('Informe o nome do setor.');
      return;
    }

    setIsCreatingSector(true);
    try {
      const sector = await createSector({ name: newSectorName.trim() });
      if (!sector) {
        toast.error('Nao foi possivel cadastrar o setor.');
        return;
      }

      setSectors((current) => [...current, sector]);
      form.setValue('sectorId', String(sector.id));
      setNewSectorName('');
      toast.success('Setor cadastrado.');
    } finally {
      setIsCreatingSector(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Configurar Escala - {user?.nome ?? user?.username ?? 'Funcionário'}
          </DialogTitle>
          <DialogDescription>
            Defina os dias e horários de trabalho para este colaborador.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {isManaged && !user && (
              <FormField
                control={form.control}
                name="usuarioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selected = usuarios.find((item) => String(item.id) === value);
                        form.setValue('projectId', selected?.projetoId ? String(selected.projetoId) : undefined);
                        form.setValue('sectorId', selected?.setorId ? String(selected.setorId) : undefined);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um colaborador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usuarios.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nome || item.username || item.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {projects.length === 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="flex gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-2">
                    <p>
                      Nenhum projeto cadastrado. Cadastre um projeto para organizar as escalas por projeto ou informe ao menos o setor do colaborador.
                    </p>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href="/dashboard/projetos/novo">Cadastrar projeto</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dates"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Dias da Escala</FormLabel>
                    <div className="rounded-md border bg-muted/20 p-2">
                      <Calendar
                        mode="multiple"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ptBR}
                        className="pointer-events-auto"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entrada</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="time" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saída</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="time" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="workMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                          <SelectItem value="REMOTO">Remoto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {projects.length > 0 && (
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projeto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um projeto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={String(project.id)}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="sectorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione um setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sectors.map((sector) => (
                              <SelectItem key={sector.id} value={String(sector.id)}>
                                {sector.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => setShowNewSectorInput(!showNewSectorInput)}
                          title="Novo setor"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {showNewSectorInput && (
                        <div className="mt-2 space-y-2 rounded-md border border-dashed p-3">
                          <p className="text-xs text-muted-foreground">
                            Cadastre um novo setor.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={newSectorName}
                              onChange={(event) => setNewSectorName(event.target.value)}
                              placeholder="Nome do setor"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                await handleCreateSector();
                                setShowNewSectorInput(false);
                              }}
                              disabled={isCreatingSector}
                            >
                              {isCreatingSector ? 'Salvando...' : 'Cadastrar'}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {sectors.length === 0 && !showNewSectorInput && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Nenhum setor cadastrado. Clique no botão + para cadastrar.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Alguma instrução adicional..." 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Escala'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
