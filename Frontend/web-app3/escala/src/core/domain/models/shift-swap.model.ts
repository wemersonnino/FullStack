import { Shift } from '@/interfaces/shift/shift.interface';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';

export type ShiftSwapRequestDraft = {
  originalShiftId?: string;
  compensationDate?: string;
  comments?: string;
};

export type ShiftSwapDecisionDraft = {
  swap?: ShiftSwap;
  status: 'approved' | 'rejected';
  adminComments?: string;
  canManage: boolean;
};

export function validateShiftSwapRequest(draft: ShiftSwapRequestDraft, availableShifts: Shift[]) {
  if (!draft.originalShiftId) {
    throw new Error('Selecione a escala original.');
  }

  const shift = availableShifts.find((item) => item.id === Number(draft.originalShiftId));
  if (!shift) {
    throw new Error('A escala selecionada não está disponível para troca.');
  }

  if (draft.compensationDate && Number.isNaN(new Date(draft.compensationDate).getTime())) {
    throw new Error('Informe uma data de compensação válida.');
  }

  if (draft.comments && draft.comments.length > 500) {
    throw new Error('A justificativa deve ter no máximo 500 caracteres.');
  }

  return {
    originalShift: shift,
    compensationRequired: Boolean(draft.compensationDate),
    compensationDate: draft.compensationDate || undefined,
    comments: draft.comments?.trim() || undefined,
  };
}

export function validateShiftSwapDecision(draft: ShiftSwapDecisionDraft) {
  if (!draft.canManage) {
    throw new Error('Você não possui permissão para decidir esta troca.');
  }

  if (!draft.swap) {
    throw new Error('Selecione uma solicitação de troca.');
  }

  if (['approved', 'effective', 'rejected', 'cancelled'].includes(draft.swap.status)) {
    throw new Error('Esta solicitação já possui uma decisão final.');
  }

  return {
    id: draft.swap.id,
    status: draft.status,
    adminComments: draft.adminComments?.trim() || undefined,
  };
}
