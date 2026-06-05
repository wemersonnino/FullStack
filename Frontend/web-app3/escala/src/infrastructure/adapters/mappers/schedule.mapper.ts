import { Shift, ShiftSwap, Schedule } from "@/core/domain/models/schedule.model";

export class ScheduleMapper {
  static shiftToDomain(dto: any): Shift {
    return {
      id: dto.id?.toString() || "",
      date: dto.shiftDate || dto.date || "",
      startTime: dto.startTime || "",
      endTime: dto.endTime || "",
      workMode: (dto.workMode?.toLowerCase() as Shift['workMode']) || 'presencial',
      status: dto.status || "",
      notes: dto.notes,
      employeeId: dto.employee?.id?.toString() || "",
      employeeName: dto.employee?.fullName || "",
    };
  }

  static shiftToDto(domain: Partial<Shift>): any {
    return {
      shiftDate: domain.date,
      startTime: domain.startTime,
      endTime: domain.endTime,
      workMode: domain.workMode?.toUpperCase(),
      notes: domain.notes,
      employeeId: domain.employeeId ? parseInt(domain.employeeId) : undefined,
    };
  }

  static swapToDomain(dto: any): ShiftSwap {
    return {
      id: dto.id?.toString() || "",
      requesterId: dto.requester?.id?.toString() || "",
      requesterName: dto.requester?.fullName || "",
      originalShift: dto.originalShift ? this.shiftToDomain(dto.originalShift) : undefined,
      compensationDate: dto.compensationDate,
      comments: dto.comments,
      adminComments: dto.adminComments,
      status: (dto.status?.toLowerCase() as ShiftSwap['status']) || 'pending',
      createdAt: dto.createdAt || "",
      decidedAt: dto.decidedAt,
    };
  }

  static swapToDto(domain: Partial<ShiftSwap>): any {
    return {
      originalShiftId: domain.originalShift?.id ? parseInt(domain.originalShift.id) : undefined,
      compensationDate: domain.compensationDate,
      comments: domain.comments,
    };
  }
}
