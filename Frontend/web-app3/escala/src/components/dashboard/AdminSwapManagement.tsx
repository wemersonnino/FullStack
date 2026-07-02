'use client';

import { useState } from 'react';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { updateShiftSwapStatus } from '@/services/shift.service';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, MessageSquare, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface AdminSwapManagementProps {
  swaps: ShiftSwap[];
}

export const AdminSwapManagement = ({ swaps }: AdminSwapManagementProps) => {
  const [selectedSwap, setSelectedSwap] = useState<ShiftSwap | null>(null);
  const [adminComments, setAdminComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingSwaps = swaps.filter((s) => s.status === 'pending' || s.status === 'colleague_approved');

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedSwap) return;
    
    setIsProcessing(true);
    try {
      const result = await updateShiftSwapStatus(selectedSwap.id, status, adminComments);
      if (result) {
        toast.success(`Solicitação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
        setSelectedSwap(null);
        setAdminComments('');
        // Em um app real, aqui dispararíamos um revalidate ou refresh da página
        window.location.reload(); 
      } else {
        toast.error('Erro ao processar solicitação.');
      }
    } catch {
      toast.error('Erro inesperado.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {pendingSwaps.length === 0 ? (
        <div className="bg-white/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center backdrop-blur-sm">
          <Check className="text-emerald-500 mb-3 h-10 w-10 opacity-70 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900">Tudo em dia!</h3>
          <p className="text-xs text-slate-500 mt-1">Não há solicitações de troca pendentes de decisão.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {pendingSwaps.map((swap) => (
            <div 
              key={swap.id} 
              className="bg-white/70 border border-slate-100 flex flex-col justify-between gap-4 rounded-2xl p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-slate-200 md:flex-row md:items-center"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-slate-950 text-white flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black">
                    {swap.requester?.username?.slice(0, 2).toUpperCase() || 'US'}
                  </div>
                  <span className="font-bold text-sm text-slate-900">{swap.requester?.username || 'Funcionário'}</span>
                  <span className="text-slate-500 text-xs">solicitou troca</span>
                  {swap.status === 'colleague_approved' ? (
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-50 rounded-full text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                      Aceito pelo colega
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-50 rounded-full text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                      Pendente Colega
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="text-slate-400 h-3.5 w-3.5" />
                    <span>
                      Jornada: <span className="font-bold text-slate-900">{swap.originalShift ? format(parseISO(swap.originalShift.date), "dd/MM/yyyy", { locale: ptBR }) : 'Data N/A'}</span>
                    </span>
                  </div>
                  {swap.compensationRequired && (
                    <div className="text-blue-700 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      <span>Compensação: <span className="font-bold">{swap.compensationDate ? format(parseISO(swap.compensationDate), "dd/MM/yyyy") : 'N/A'}</span></span>
                    </div>
                  )}
                </div>
 
                {swap.comments && (
                  <div className="bg-slate-50 border border-slate-100/50 flex items-start gap-2 rounded-xl p-3 text-xs italic text-slate-600">
                    <MessageSquare className="text-slate-400 mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p>&ldquo;{swap.comments}&rdquo;</p>
                  </div>
                )}
              </div>
 
              <div className="flex gap-2 shrink-0 self-end md:self-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-xs font-bold"
                  onClick={() => setSelectedSwap(swap)}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" /> Rejeitar
                </Button>
                <Button 
                  size="sm"
                  className="rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm"
                  onClick={() => setSelectedSwap(swap)}
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Aprovar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedSwap} onOpenChange={(open) => !open && setSelectedSwap(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processar Solicitação</DialogTitle>
            <DialogDescription>
              Adicione um comentário opcional para o funcionário sobre a decisão.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              placeholder="Ex: Escala aprovada conforme solicitação..."
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setSelectedSwap(null)}>Cancelar</Button>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                disabled={isProcessing}
                onClick={() => handleAction('rejected')}
              >
                Confirmar Rejeição
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                disabled={isProcessing}
                onClick={() => handleAction('approved')}
              >
                Confirmar Aprovação
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
