'use client';

import { 
  Clock, 
  MapPin, 
  MoreVertical,
  X,
  User,
  ExternalLink
} from 'lucide-react';
import { Escala } from '@/interfaces/escala/escala.interface';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EscalaDayDetailsProps {
  date: Date | null;
  escalas: Escala[];
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function EscalaDayDetails({ date, escalas, isOpen, onClose, isAdmin }: EscalaDayDetailsProps) {
  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Escalas para {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {escalas.map((escala) => (
            <div 
              key={escala.id} 
              className="flex items-start gap-4 p-4 rounded-xl border bg-card/50"
            >
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarImage src={escala.avatarUrl} />
                <AvatarFallback>{escala.nomeUsuario?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-base truncate">{escala.nomeUsuario}</h4>
                  <Badge variant="outline" className="text-[10px]">{escala.workMode}</Badge>
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

                {escala.observacao && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground italic">
                    "{escala.observacao}"
                  </div>
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

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          {isAdmin && (
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Gerenciar Todos
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
