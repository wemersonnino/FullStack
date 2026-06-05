export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  workMode: 'presencial' | 'remoto';
  status: string;
  notes?: string;
  employeeId: string;
  employeeName: string;
}

export interface ShiftSwap {
  id: string;
  requesterId: string;
  requesterName: string;
  originalShift?: Shift;
  compensationDate?: string;
  comments?: string;
  adminComments?: string;
  status: 'pending' | 'colleague_approved' | 'approved' | 'effective' | 'rejected' | 'cancelled';
  createdAt: string;
  decidedAt?: string;
}

export interface Schedule {
  id: string;
  year: number;
  month: number;
  shifts: Shift[];
}
