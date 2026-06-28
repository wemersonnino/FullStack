'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, CheckCircle2, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shift } from '@/interfaces/shift/shift.interface';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { ShiftSwapService } from '@/core/application/services/shift-swap.service';
import { useTrocasUiStore } from '../store/useTrocasUiStore';

type TrocasTurnoActionsProps = {
  shifts: Shift[];
  swaps: ShiftSwap[];
  canManage: boolean;
};

export function TrocasTurnoActions({ shifts, swaps, canManage }: TrocasTurnoActionsProps) {
  const router = useRouter();
  const requestDialogOpen = useTrocasUiStore((state) => state.requestDialogOpen);
  const detailsDialogOpen = useTrocasUiStore((state) => state.detailsDialogOpen);
  const selectedSwapId = useTrocasUiStore((state) => state.selectedSwapId);
  const openRequestDialog = useTrocasUiStore((state) => state.openRequestDialog);
  const closeRequestDialog = useTrocasUiStore((state) => state.closeRequestDialog);
  const closeDetailsDialog = useTrocasUiStore((state) => state.closeDetailsDialog);

  const [originalShiftId, setOriginalShiftId] = useState('');
  const [compensationDate, setCompensationDate] = useState('');
  const [comments, setComments] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedSwap = useMemo(
    () => swaps.find((swap) => swap.id === selectedSwapId),
    [selectedSwapId, swaps]
  );

  async function handleCreateSwap() {
    setSubmitting(true);
    try {
      await ShiftSwapService.requestSwap({ originalShiftId, compensationDate, comments }, shifts);
      toast.success('Solicitação enviada.');
      setOriginalShiftId('');
      setCompensationDate('');
      setComments('');
      closeRequestDialog();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível solicitar a troca.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDecision(status: 'approved' | 'rejected') {
    if (!selectedSwap) return;
    setSubmitting(true);
    try {
      await ShiftSwapService.decideSwap({ swap: selectedSwap, status, adminComments, canManage });
      toast.success(status === 'approved' ? 'Troca aprovada.' : 'Troca rejeitada.');
      setAdminComments('');
      closeDetailsDialog();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível registrar a decisão.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button className="gap-2" type="button" onClick={openRequestDialog}>
        <ArrowLeftRight className="h-4 w-4" />
        Solicitar Troca
      </Button>

      <Dialog open={requestDialogOpen} onOpenChange={(open) => (open ? openRequestDialog() : closeRequestDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar troca de escala</DialogTitle>
            <DialogDescription>Escolha uma escala e informe a compensação quando aplicável.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Escala original</Label>
              <Select value={originalShiftId} onValueChange={setOriginalShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escala" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={String(shift.id)}>
                      {shift.date} • {shift.workMode ?? 'presencial'} • #{shift.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="compensation-date">Data de compensação</Label>
              <Input id="compensation-date" type="date" value={compensationDate} onChange={(event) => setCompensationDate(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="swap-comments">Justificativa</Label>
              <Textarea id="swap-comments" value={comments} onChange={(event) => setComments(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRequestDialog} disabled={submitting}>Cancelar</Button>
            <Button onClick={handleCreateSwap} disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar solicitação'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={(open) => (!open ? closeDetailsDialog() : undefined)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da troca</DialogTitle>
            <DialogDescription>Dados renderizados pela página e ações enviadas ao service.</DialogDescription>
          </DialogHeader>
          {selectedSwap && (
            <div className="grid gap-4">
              <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Solicitante</p>
                  <p className="font-medium">{selectedSwap.requester?.username ?? 'Não informado'}</p>
                  <p className="text-sm text-muted-foreground">{selectedSwap.requester?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium uppercase">{selectedSwap.status.replaceAll('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Escala original</p>
                  <p className="font-medium">{selectedSwap.originalShift?.date ?? 'Não informada'}</p>
                  <p className="text-sm text-muted-foreground">#{selectedSwap.originalShift?.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Compensação</p>
                  <p className="font-medium">{selectedSwap.compensationDate ?? 'Não informada'}</p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Justificativa</p>
                <p className="mt-1 text-sm">{selectedSwap.comments || 'Sem justificativa registrada.'}</p>
              </div>
              {canManage && (
                <div className="grid gap-2">
                  <Label htmlFor="admin-comments">Comentário da decisão</Label>
                  <Textarea id="admin-comments" value={adminComments} onChange={(event) => setAdminComments(event.target.value)} />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={closeDetailsDialog}>Fechar</Button>
            {canManage && (
              <div className="flex gap-2">
                <Button variant="destructive" className="gap-2" onClick={() => handleDecision('rejected')} disabled={submitting}>
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
                <Button className="gap-2" onClick={() => handleDecision('approved')} disabled={submitting}>
                  <CheckCircle2 className="h-4 w-4" />
                  Aprovar
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TrocasTurnoDetailsButton({ swapId }: { swapId: string }) {
  const openDetailsDialog = useTrocasUiStore((state) => state.openDetailsDialog);

  return (
    <Button variant="ghost" size="sm" className="gap-2" onClick={() => openDetailsDialog(swapId)}>
      <Info className="h-4 w-4" />
      Ver detalhes
    </Button>
  );
}
