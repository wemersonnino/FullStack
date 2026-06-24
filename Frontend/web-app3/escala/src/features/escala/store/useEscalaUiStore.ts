'use client';

import { create } from 'zustand/react';

type EscalaUiState = {
  createDialogOpen: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  setCreateDialogOpen: (open: boolean) => void;
};

export const useEscalaUiStore = create<EscalaUiState>((set) => ({
  createDialogOpen: false,
  openCreateDialog: () => set({ createDialogOpen: true }),
  closeCreateDialog: () => set({ createDialogOpen: false }),
  setCreateDialogOpen: (open) => set({ createDialogOpen: open }),
}));
