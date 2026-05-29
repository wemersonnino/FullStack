'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShiftSwapSchema, ShiftSwapSchemaType } from '@/lib/schemas/shift-swap.schema';
import { useShiftSwapRequest } from '@/features/shift-swaps/hooks/useShiftSwapRequest';
import { Shift } from '@/interfaces/shift/shift.interface';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ShiftSwapFormProps {
  shifts: Shift[];
}

export const ShiftSwapForm = ({ shifts }: ShiftSwapFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSubmitting, submit } = useShiftSwapRequest();

  const form = useForm<ShiftSwapSchemaType>({
    resolver: zodResolver(ShiftSwapSchema),
    defaultValues: {
      originalShift: '',
      compensationRequired: false,
      compensationDate: '',
      comments: '',
    },
  });

  const compensationRequired = form.watch('compensationRequired');

  const onSubmit = async (data: ShiftSwapSchemaType) => {
    try {
      const result = await submit({
        originalShiftId: Number(data.originalShift),
        compensationDate: data.compensationRequired ? data.compensationDate : undefined,
        comments: data.comments,
      });

      if (result) {
        toast.success('Solicitação de troca enviada com sucesso!');
        form.reset();
        setIsOpen(false);
      } else {
        toast.error('Erro ao enviar solicitação. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao solicitar troca:', error);
      toast.error('Ocorreu um erro inesperado.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Solicitar Troca</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Solicitar Troca de Escala</DialogTitle>
          <DialogDescription>
            Escolha o turno que deseja trocar e informe se haverá compensação.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="originalShift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno para Troca</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um turno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {format(parseISO(shift.date), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compensationRequired"
              render={({ field }) => (
                <FormItem className="bg-muted/30 flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Compensação Necessária</FormLabel>
                    <FormDescription>
                      Você pretende compensar este turno em outra data?
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

            {compensationRequired && (
              <FormField
                control={form.control}
                name="compensationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Compensação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o motivo ou detalhes da troca..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Confirmar Solicitação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
