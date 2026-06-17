'use client';

import { useMemo } from 'react';
import { Escala, UsuarioEscala } from '@/core/domain/escala/escala.types';
import { createEscalaMatrix } from '@/lib/utils/matrix';
import { SHIFT_COLORS } from '@/lib/constants/colors';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EscalaShiftGridProps {
  usuarios: UsuarioEscala[];
  escalas: Escala[];
  startDate: Date;
  endDate: Date;
}

export function EscalaShiftGrid({ usuarios, escalas, startDate, endDate }: EscalaShiftGridProps) {
  // Otimização: Criar matriz O(1) de acesso
  const { matrix, days } = useMemo(() => 
    createEscalaMatrix(usuarios, escalas, startDate, endDate),
    [usuarios, escalas, startDate, endDate]
  );

  function getStatusStyle(escala: Escala | null) {
    if (!escala) return SHIFT_COLORS.OFF;
    const status = escala.status?.toUpperCase();
    if (status?.includes('CONFLITO')) return SHIFT_COLORS.CONFLICT;
    if (status === 'PENDING') return SHIFT_COLORS.PENDING;
    if (status?.includes('SWAP')) return SHIFT_COLORS.SWAP;
    if (escala.workMode === 'REMOTO') return SHIFT_COLORS.REMOTE;
    return SHIFT_COLORS.PRESENTIAL;
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="sticky left-0 z-10 bg-muted/50 backdrop-blur w-[240px] border-r">
                Colaborador
              </TableHead>
              {days.map((day) => (
                <TableHead key={day.toISOString()} className="text-center p-2 min-w-[40px] border-r last:border-r-0">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {format(day, 'eee', { locale: ptBR })}
                    </span>
                    <span className={cn(
                      "text-sm font-bold",
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && "text-primary"
                    )}>
                      {format(day, 'dd')}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario, rowIndex) => (
              <TableRow key={usuario.id} className="hover:bg-muted/10">
                <TableCell className="sticky left-0 z-10 bg-background border-r py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={usuario.avatarUrl || ''} />
                      <AvatarFallback className="text-[10px]">
                        {usuario.nome?.substring(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium line-clamp-1">{usuario.nome}</span>
                      <span className="text-[10px] text-muted-foreground">{usuario.cargo || 'Funcionário'}</span>
                    </div>
                  </div>
                </TableCell>
                {matrix[rowIndex].map((escala, colIndex) => {
                  const style = getStatusStyle(escala);
                  return (
                    <TableCell 
                      key={`${usuario.id}-${colIndex}`} 
                      className={cn(
                        "p-1 text-center border-r last:border-r-0 transition-colors",
                        escala ? style.bg : "bg-transparent"
                      )}
                    >
                      {escala ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <div className={cn("h-6 w-1 rounded-full", style.dot)} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs p-1">
                                <p className="font-bold">{escala.startTime} - {escala.endTime}</p>
                                <p>{escala.workMode}</p>
                                <p className="capitalize">{escala.status?.toLowerCase()}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="h-6" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
