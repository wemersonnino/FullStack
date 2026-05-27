import { API_ROUTES } from '@/constants';
import { httpGet, httpPatch, httpPost } from '@/lib/http/request';
import { Shift } from '@/interfaces/shift/shift.interface';
import { ShiftSwap } from '@/interfaces/shift/shift-swap.interface';
import { WorkSchedule } from '@/interfaces/shift/work-schedule.interface';

type BackendEmployee = {
  id: number;
  fullName: string;
  email: string;
};

type BackendShift = {
  id: number;
  employee: BackendEmployee;
  shiftDate: string;
  startTime: string;
  endTime: string;
  workMode?: 'PRESENCIAL' | 'REMOTO';
  status: string;
  notes?: string;
};

type BackendShiftSwap = {
  id: number;
  requester?: BackendEmployee;
  originalShift?: BackendShift;
  compensationDate?: string;
  comments?: string;
  adminComments?: string;
  status: 'PENDING' | 'COLLEAGUE_APPROVED' | 'APPROVED' | 'EFFECTIVE' | 'REJECTED' | 'CANCELLED';
  createdAt?: string;
  decidedAt?: string;
};

function mapBackendShift(shift: BackendShift): Shift {
  return {
    id: shift.id,
    documentId: String(shift.id),
    date: shift.shiftDate,
    workMode: shift.workMode?.toLowerCase() as Shift['workMode'],
    notes: shift.notes,
    createdAt: '',
    updatedAt: '',
  };
}

function mapBackendShiftSwap(swap: BackendShiftSwap): ShiftSwap {
  return {
    id: swap.id,
    documentId: String(swap.id),
    compensationRequired: Boolean(swap.compensationDate),
    compensationDate: swap.compensationDate,
    comments: swap.comments,
    status: swap.status.toLowerCase() as ShiftSwap['status'],
    adminComments: swap.adminComments,
    originalShift: swap.originalShift ? mapBackendShift(swap.originalShift) : undefined,
    createdAt: swap.createdAt ?? '',
    updatedAt: swap.decidedAt ?? swap.createdAt ?? '',
  };
}

export async function getShifts(authToken?: string): Promise<Shift[]> {
  try {
    const today = new Date();
    const json = await httpGet<BackendShift[]>(
      API_ROUTES.SHIFTS,
      {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      },
      { authToken }
    );
    return Array.isArray(json) ? json.map(mapBackendShift) : [];
  } catch (error) {
    console.error('Erro ao buscar escalas:', error);
    return [];
  }
}

export async function getShiftSwaps(authToken?: string): Promise<ShiftSwap[]> {
  try {
    const json = await httpGet<BackendShiftSwap[]>(API_ROUTES.SHIFT_SWAPS, undefined, { authToken });
    return Array.isArray(json) ? json.map(mapBackendShiftSwap) : [];
  } catch (error) {
    console.error('Erro ao buscar trocas de escala:', error);
    return [];
  }
}

export async function getWorkSchedules(authToken?: string): Promise<WorkSchedule[]> {
  void authToken;
  try {
    return [];
  } catch (error) {
    console.error('Erro ao buscar horários de trabalho:', error);
    return [];
  }
}

export async function createShiftSwap(data: Partial<ShiftSwap>): Promise<ShiftSwap | null> {
    try {
        const response = await httpPost<BackendShiftSwap>(API_ROUTES.SHIFT_SWAPS, {
            originalShiftId: data.originalShift?.id,
            compensationDate: data.compensationDate,
            comments: data.comments,
        });
        return response ? mapBackendShiftSwap(response) : null;
    } catch (error) {
        console.error('Erro ao criar troca de escala:', error);
        return null;
    }
}

export async function updateShiftSwapStatus(id: number, status: 'approved' | 'rejected', adminComments?: string): Promise<ShiftSwap | null> {
    try {
        const response = await httpPatch<BackendShiftSwap>(`${API_ROUTES.SHIFT_SWAPS}/${id}/decision`, {
            approved: status === 'approved',
            adminComments,
        });
        return response ? mapBackendShiftSwap(response) : null;
    } catch (error) {
        console.error(`Erro ao ${status === 'approved' ? 'aprovar' : 'rejeitar'} troca de escala:`, error);
        return null;
    }
}
