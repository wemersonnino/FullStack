'use client';

import { create } from 'zustand/react';

type TrocasUiState = {
  requestDialogOpen: boolean;
  detailsDialogOpen: boolean;
  selectedSwapId?: number;
  openRequestDialog: () => void;
  closeRequestDialog: () => void;
  openDetailsDialog: (swapId: number) => void;
  closeDetailsDialog: () => void;
};

export const useTrocasUiStore = create<TrocasUiState>((set) => ({
  requestDialogOpen: false,
  detailsDialogOpen: false,
  selectedSwapId: undefined,
  openRequestDialog: () => set({ requestDialogOpen: true }),
  closeRequestDialog: () => set({ requestDialogOpen: false }),
  openDetailsDialog: (swapId) => set({ detailsDialogOpen: true, selectedSwapId: swapId }),
  closeDetailsDialog: () => set({ detailsDialogOpen: false, selectedSwapId: undefined }),
}));
