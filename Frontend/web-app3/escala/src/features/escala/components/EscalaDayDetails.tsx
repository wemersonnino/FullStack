'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  MapPin, 
  MoreVertical,
  User,
  ExternalLink,
  Repeat2,
  AlertTriangle
} from 'lucide-react';
import { Escala } from '@/interfaces/escala/escala.interface';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useShiftSwapRequest } from '@/features/shift-swaps/hooks/useShiftSwapRequest';
import { WorkScheduleModal } from '@/components/dashboard/WorkScheduleModal';

interface EscalaDayDetailsProps {
  date: Date | null;
  escalas: Escala[];
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function EscalaDayDetails({ date, escalas, isOpen, onClose, isAdmin }: EscalaDayDetailsProps) {
  const { isSubmitting, submit } = useShiftSwapRequest();
  const [selectedSwapEscala, setSelectedSwapEscala] = useState<Escala | null>(null);
  const [compensationDate, setCompensationDate] = useState('');
  const [comments, setComments] = useState('');

  if (!date) return null;

  async function handleSubmitSwap() {
    if (!selectedSwapEscala) return;

    try {
      const swap = await submit({
        originalShiftId: selectedSwapEscala.id,
        compensationDate: compensationDate || undefined,
        comments: comments || undefined,
      });

      if (!swap) {
        toast.error('Nao foi possivel solicitar a troca.');
        return;
      }

      toast.success('Solicitacao de troca enviada.');
      setSelectedSwapEscala(null);
      setCompensationDate('');
      setComments('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel solicitar a troca.';
      toast.error(message);
    }
  }

  function closeDetails(open: boolean) {
    if (open) return;
    setSelectedSwapEscala(null);
    setCompensationDate('');
    setComments('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeDetails}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Escalas para {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
          <DialogDescription>
            {isAdmin
              ? 'Veja quem esta escalado e identifique cobertura, modalidade e observacoes do dia.'
              : 'Veja sua escala e solicite troca quando precisar ajustar a cobertura.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[56vh] space-y-4 overflow-y-auto py-4 pr-1">
          {escalas.map((escala) => (
            <div 
              key={escala.id} 
              className="flex items-start gap-4 rounded-lg border bg-card/50 p-4"
            >
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarImage src={escala.avatarUrl} />
                <AvatarFallback>{escala.nomeUsuario?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-base truncate">{escala.nomeUsuario}</h4>
                  <Badge variant="outline" className="text-[10px]">
                    {escala.workMode === 'REMOTO' ? 'Remoto' : 'Presencial'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{escala.cargo || 'Colaborador'}</p>

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{escala.horarioInicio} - {escala.horarioFim}</span>
                  </div>
                  {escala.setor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{escala.setor}</span>
                    </div>
                  )}
                </div>

                {escala.status && escala.status !== 'AGENDADA' && escala.status !== 'SCHEDULED' && (
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Status: {escala.status}</span>
                  </div>
                )}

                {escala.observacao && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground italic">
                    &quot;{escala.observacao}&quot;
                  </div>
                )}

                {!isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => setSelectedSwapEscala(escala)}
                  >
                    <Repeat2 className="h-4 w-4" />
                    Solicitar troca
                  </Button>
                )}
              </div>

              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {escalas.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto opacity-10 mb-4" />
              <p>Nenhuma escala registrada para este dia.</p>
            </div>
          )}
        </div>

        {selectedSwapEscala && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold">Solicitar troca</h3>
              <p className="text-xs text-muted-foreground">
                Escala de {selectedSwapEscala.horarioInicio} as {selectedSwapEscala.horarioFim}. A compensacao e opcional, mas ajuda o gestor a decidir.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="compensation-date">Data de compensacao</Label>
                <Input
                  id="compensation-date"
                  type="date"
                  value={compensationDate}
                  onChange={(event) => setCompensationDate(event.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="swap-comments">Comentario</Label>
                <Textarea
                  id="swap-comments"
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  maxLength={500}
                  placeholder="Explique o motivo ou combine os detalhes da troca."
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          {!isAdmin && (
            <div className="flex-1">
	              <WorkScheduleModal 
	                schedules={[{
	                  id: 1,
	                  documentId: 'local-default',
	                  active: true,
	                  fixedDays: 'Segunda a Sexta',
	                  frequency: 'every_week',
	                  minimumWeeklyShifts: 5,
	                  createdAt: new Date(0).toISOString(),
	                  updatedAt: new Date(0).toISOString(),
	                }]} 
	              />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => closeDetails(false)}>Fechar</Button>
            {selectedSwapEscala && (
              <Button onClick={handleSubmitSwap} disabled={isSubmitting} className="gap-2">
                <Repeat2 className="h-4 w-4" />
                {isSubmitting ? 'Enviando...' : 'Confirmar solicitacao'}
              </Button>
            )}
            {isAdmin && (
              <Button className="gap-2" asChild>
                <Link href="/dashboard/escala/admin">
                <ExternalLink className="h-4 w-4" />
                Gerenciar Todos
                </Link>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
