'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Briefcase,
  Save
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
import { Popover, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UsuarioEscala, EscalaRequest } from '@/interfaces/escala/escala.interface';
import { createEscalas } from '@/services/escala.service';

const EscalaSchema = z.object({
  dates: z.array(z.date()).min(1, 'Selecione pelo menos um dia.'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido.'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido.'),
  workMode: z.enum(['PRESENCIAL', 'REMOTO', 'HIBRIDO']),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  sectorId: z.string().optional(),
});

type EscalaFormValues = z.infer<typeof EscalaSchema>;

interface EscalaUserEditModalProps {
  user: UsuarioEscala | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EscalaUserEditModal({ user, isOpen, onClose, onSuccess }: EscalaUserEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EscalaFormValues>({
    resolver: zodResolver(EscalaSchema),
    defaultValues: {
      dates: [],
      startTime: '08:00',
      endTime: '17:00',
      workMode: 'PRESENCIAL',
      notes: '',
    },
  });

  async function onSubmit(values: EscalaFormValues) {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const payload: EscalaRequest = {
        employeeId: user.id,
        dates: values.dates.map(d => format(d, 'yyyy-MM-dd')),
        startTime: values.startTime,
        endTime: values.endTime,
        workMode: values.workMode,
        notes: values.notes,
        projectId: values.projectId ? parseInt(values.projectId) : undefined,
        sectorId: values.sectorId ? parseInt(values.sectorId) : undefined,
      };

      await createEscalas(payload);
      toast.success('Escala(s) criada(s) com sucesso.');
      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar escala.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Configurar Escala - {user?.nome}
          </DialogTitle>
          <DialogDescription>
            Defina os dias e horários de trabalho para este colaborador.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                          <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projeto (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um projeto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Projeto Escala</SelectItem>
                          <SelectItem value="2">Core Banking</SelectItem>
                        </SelectContent>
                      </Select>
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
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
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
