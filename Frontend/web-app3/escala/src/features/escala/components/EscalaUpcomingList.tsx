'use client';

import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Pencil
} from 'lucide-react';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Escala } from '@/core/domain/escala/escala.types';
import { cn } from '@/lib/utils';

interface EscalaUpcomingListProps {
  escalas: Escala[];
  title?: string;
  limit?: number;
  canManage?: boolean;
  onEdit?: (escala: Escala) => void;
}

export function EscalaUpcomingList({
  escalas,
  title = "Proximas Escalas",
  limit = 5,
  canManage = false,
  onEdit,
}: EscalaUpcomingListProps) {
  const today = startOfToday();
  const upcoming = escalas
    .filter((escala) => !isAfter(today, parseISO(escala.dataInicio)))
    .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
    .slice(0, limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">Ver todas</Button>
      </div>

      <div className="space-y-3">
        {upcoming.map((escala) => (
          <div 
            key={escala.id} 
            className="group relative flex items-center gap-4 p-3 rounded-xl border bg-card hover:bg-muted/5 transition-all hover:shadow-sm"
          >
            <div className={cn(
              "flex flex-col items-center justify-center h-12 w-12 rounded-lg border",
              escala.remoto ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20"
            )}>
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                {format(parseISO(escala.dataInicio), 'MMM', { locale: ptBR })}
              </span>
              <span className="text-lg font-bold leading-none">
                {format(parseISO(escala.dataInicio), 'dd')}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{escala.nomeUsuario}</h4>
                <span className="size-1 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  {escala.remoto ? 'REMOTO' : 'PRESENCIAL'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {escala.horarioInicio || '--:--'} - {escala.horarioFim || '--:--'}
                </span>
                {(escala.setorNome || escala.setor) && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3.5 w-3.5" />
                    {escala.setorNome || escala.setor}
                  </span>
                )}
              </div>
            </div>

            {canManage && onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Editar escala de ${escala.nomeUsuario}`}
                onClick={() => onEdit(escala)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {upcoming.length === 0 && (
          <div className="py-10 text-center border border-dashed rounded-xl bg-muted/5">
            <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma escala programada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
