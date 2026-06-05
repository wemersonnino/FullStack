import { Shift, ShiftSwap } from "@/core/domain/models/schedule.model";
import { ScheduleBackendAdapter } from "@/infrastructure/adapters/schedule.adapter";

export class ScheduleService {
  static async listShifts(token: string, params?: URLSearchParams): Promise<Shift[]> {
    return await ScheduleBackendAdapter.listShifts(token, params);
  }

  static async createShift(shift: Partial<Shift>, token: string): Promise<Shift> {
    return await ScheduleBackendAdapter.createShift(shift, token);
  }

  static async updateShift(id: string, shift: Partial<Shift>, token: string): Promise<Shift> {
    return await ScheduleBackendAdapter.updateShift(id, shift, token);
  }

  static async deleteShift(id: string, token: string): Promise<void> {
    return await ScheduleBackendAdapter.deleteShift(id, token);
  }

  // Swaps
  static async listSwaps(token: string): Promise<ShiftSwap[]> {
    return await ScheduleBackendAdapter.listSwaps(token);
  }

  static async createSwap(swap: Partial<ShiftSwap>, token: string): Promise<ShiftSwap> {
    return await ScheduleBackendAdapter.createSwap(swap, token);
  }

  static async decideSwap(id: string, decision: { approved: boolean; adminComments?: string }, token: string): Promise<ShiftSwap> {
    return await ScheduleBackendAdapter.decideSwap(id, decision, token);
  }
}
