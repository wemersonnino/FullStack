'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageModel } from '@/infrastructure/adapters/message.adapter';
import { MessageService } from '@/core/application/services/message.service';
import { toast } from 'sonner';

interface MessageDetailsModalProps {
  message: MessageModel | null;
  isOpen: boolean;
  onClose: () => void;
  onDecisionSuccess: () => void;
}

export const MessageDetailsModal = ({
  message,
  isOpen,
  onClose,
  onDecisionSuccess,
}: MessageDetailsModalProps) => {
  const [loading, setLoading] = useState(false);

  if (!message) return null;

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await MessageService.decideMessage(message.id, decision);
      toast.success(`Solicitação ${decision === 'APPROVED' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      onDecisionSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao processar a decisão.');
    } finally {
      setLoading(false);
    }
  };

  const isRequest = message.type === 'PERMISSION_REQUEST' || message.type === 'SHIFT_SWAP';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border border-border/80 bg-background/95 backdrop-blur-md rounded-2xl shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="uppercase font-bold tracking-wider text-[10px]">
              {message.type.replace('_', ' ')}
            </Badge>
            <Badge variant={message.status === 'PENDING' ? 'secondary' : 'default'} className="uppercase font-bold tracking-wider text-[10px]">
              {message.status}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">{message.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Enviado em {new Date(message.createdAt).toLocaleString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4 bg-border/60" />

        <div className="py-4 space-y-4">
          <div className="bg-muted/40 p-4 rounded-xl border border-border/40">
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{message.content}</p>
          </div>

          {message.metadata && (
            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/20">
              <span className="font-semibold block mb-1">Informações Técnicas (Metadata):</span>
              <code className="block bg-card p-2 rounded text-[11px] font-mono break-all text-foreground/80">
                {message.metadata}
              </code>
            </div>
          )}
        </div>

        <Separator className="my-2 bg-border/60" />

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          {isRequest && message.status === 'PENDING' ? (
            <>
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 border-red-500/20 text-red-500 font-bold transition-all"
                onClick={() => handleDecision('REJECTED')}
                disabled={loading}
              >
                Rejeitar
              </Button>
              <Button
                className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md shadow-primary/10 transition-all"
                onClick={() => handleDecision('APPROVED')}
                disabled={loading}
              >
                Aprovar
              </Button>
            </>
          ) : (
            <Button
              className="w-full sm:w-auto rounded-xl"
              onClick={onClose}
            >
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
