import { Shift } from '@/interfaces/shift/shift.interface';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { WorkSchedule, DayOfWeek, FrequencyType } from '@/interfaces/shift/work-schedule.interface';

export function mapShift(item: any): Shift {
  return {
    id: item.id,
    documentId: item.documentId,
    date: item.date,
    workMode: item.workMode,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
  };
}

export function mapShifts(data: any[]): Shift[] {
  return data.map(mapShift);
}

export function mapShiftSwap(item: any): ShiftSwap {
  return {
    id: item.id,
    documentId: item.documentId,
    compensationRequired: item.compensationRequired,
    compensationDate: item.compensationDate,
    comments: item.comments,
    status: item.status || 'pending',
    adminComments: item.adminComments,
    requester: item.requester, // Simplified for now, can be mapped further
    receiver: item.receiver,
    originalShift: item.originalShift ? mapShift(item.originalShift) : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
  };
}

export function mapShiftSwaps(data: any[]): ShiftSwap[] {
  return data.map(mapShiftSwap);
}

export function mapWorkSchedule(item: any): WorkSchedule {
  return {
    id: item.id,
    documentId: item.documentId,
    fixedDays: item.fixedDays,
    alternatingDay: item.alternatingDay as DayOfWeek,
    frequency: item.frequency as FrequencyType,
    minimumWeeklyShifts: item.minimumWeeklyShifts,
    active: item.active,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
  };
}

export function mapWorkSchedules(data: any[]): WorkSchedule[] {
  return data.map(mapWorkSchedule);
}
