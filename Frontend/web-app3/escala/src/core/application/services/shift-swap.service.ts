import { Shift } from '@/interfaces/shift/shift.interface';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import {
  ShiftSwapDecisionDraft,
  ShiftSwapRequestDraft,
  validateShiftSwapDecision,
  validateShiftSwapRequest,
} from '@/core/domain/models/shift-swap.model';
import { createShiftSwap, updateShiftSwapStatus } from '@/services/shift.service';

export class ShiftSwapService {
  static async requestSwap(draft: ShiftSwapRequestDraft, availableShifts: Shift[]) {
    const payload = validateShiftSwapRequest(draft, availableShifts);
    return createShiftSwap(payload);
  }

  static async decideSwap(draft: ShiftSwapDecisionDraft): Promise<ShiftSwap | null> {
    const decision = validateShiftSwapDecision(draft);
    return updateShiftSwapStatus(decision.id, decision.status, decision.adminComments);
  }
}
