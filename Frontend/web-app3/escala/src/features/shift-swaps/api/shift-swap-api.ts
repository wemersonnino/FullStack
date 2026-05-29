import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { createShiftSwap } from '@/services/shift.service';

export type SubmitShiftSwapRequest = {
  originalShiftId: number;
  compensationDate?: string;
  comments?: string;
};

export async function submitShiftSwapRequest(data: SubmitShiftSwapRequest): Promise<ShiftSwap | null> {
  return createShiftSwap({
    originalShift: { id: data.originalShiftId } as ShiftSwap['originalShift'],
    compensationRequired: Boolean(data.compensationDate),
    compensationDate: data.compensationDate,
    comments: data.comments,
  });
}
