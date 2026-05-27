'use client';

import { useState } from 'react';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { updateShiftSwapStatus } from '@/services/shift.service';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, MessageSquare, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const pendingSwaps = swaps.filter((s) => s.status === 'pending');

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
    } catch (error) {
      toast.error('Erro inesperado.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Trocas</h2>
        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {pendingSwaps.length} Pendentes
        </span>
      </div>

      {pendingSwaps.length === 0 ? (
        <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <Check className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
          <h3 className="text-lg font-medium">Tudo em dia!</h3>
          <p className="text-muted-foreground text-sm">Não há solicitações de troca aguardando aprovação.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingSwaps.map((swap) => (
            <div key={swap.id} className="bg-card flex flex-col justify-between gap-4 rounded-xl border p-5 shadow-sm md:flex-row md:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{swap.requester?.username || 'Funcionário'}</span>
                  <span className="text-muted-foreground text-sm">solicitou troca de:</span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">
                      {swap.originalShift ? format(parseISO(swap.originalShift.date), "dd/MM/yyyy", { locale: ptBR }) : 'Data N/A'}
                    </span>
                  </div>
                  {swap.compensationRequired && (
                    <div className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>Compensação em: {swap.compensationDate ? format(parseISO(swap.compensationDate), "dd/MM/yyyy") : 'N/A'}</span>
                    </div>
                  )}
                </div>

                {swap.comments && (
                  <div className="bg-muted/50 flex items-start gap-2 rounded-lg p-3 text-sm italic">
                    <MessageSquare className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <p>&ldquo;{swap.comments}&rdquo;</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => setSelectedSwap(swap)}
                >
                  <X className="mr-2 h-4 w-4" /> Rejeitar
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setSelectedSwap(swap);
                    // Aqui poderíamos abrir um modal de confirmação ou aprovar direto
                  }}
                >
                  <Check className="mr-2 h-4 w-4" /> Aprovar
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
