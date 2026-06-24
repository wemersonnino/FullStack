'use client';

import { Escala as LegacyEscala } from '@/interfaces/escala/escala.interface';
import { UsuarioEscala } from '@/core/domain/escala/escala.types';
import { EscalaCalendar } from './EscalaCalendar';
import { EscalaCreateDialog } from './EscalaCreateDialog';
import { useEscalaUiStore } from '../store/useEscalaUiStore';

type EscalaPageClientProps = {
  escalas: LegacyEscala[];
  usuarios?: UsuarioEscala[];
  canViewAllEscalas: boolean;
};

export function EscalaPageClient({ escalas, usuarios, canViewAllEscalas }: EscalaPageClientProps) {
  const createDialogOpen = useEscalaUiStore((state) => state.createDialogOpen);
  const openCreateDialog = useEscalaUiStore((state) => state.openCreateDialog);
  const setCreateDialogOpen = useEscalaUiStore((state) => state.setCreateDialogOpen);

  return (
    <>
      <EscalaCalendar
        escalas={escalas}
        isAdmin={canViewAllEscalas}
        onAddEvent={openCreateDialog}
      />
      <EscalaCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialUsuarios={usuarios}
      />
    </>
  );
}
