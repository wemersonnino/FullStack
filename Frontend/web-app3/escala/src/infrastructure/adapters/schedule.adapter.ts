import { ScheduleMapper } from "./mappers/schedule.mapper";
import {
  CreateScheduleCycleInput,
  CreateScheduleHolidayInput,
  MonthCalendar,
  ScheduleCycle,
  ScheduleHoliday,
  ScheduleLegend,
  Shift,
  ShiftSwap,
} from "@/core/domain/models/schedule.model";

export class ScheduleBackendAdapter {
  private static baseUrl = '/api/bff';

  private static url(path: string) {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') return url;
    return new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
  }

  static async listShifts(token: string, params?: URLSearchParams): Promise<Shift[]> {
    const url = new URL(this.url('/escala'));
    if (params) {
      params.forEach((value, key) => url.searchParams.set(key, value));
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch shifts");
    const dtos = await response.json();
    return dtos.map((dto: any) => ScheduleMapper.shiftToDomain(dto));
  }

  static async getMonthCalendar(
    token: string,
    params: { year: number; month: number; unitId?: number; timezone?: string }
  ): Promise<MonthCalendar> {
    const url = new URL(this.url('/scheduling/month-calendar'));
    url.searchParams.set('year', String(params.year));
    url.searchParams.set('month', String(params.month));
    if (params.unitId !== undefined) {
      url.searchParams.set('unitId', String(params.unitId));
    }
    if (params.timezone) {
      url.searchParams.set('timezone', params.timezone);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch month calendar");
    return response.json();
  }

  static async listSchedulingLegends(token: string): Promise<ScheduleLegend[]> {
    const response = await fetch(this.url('/scheduling/legends'), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch scheduling legends");
    return response.json();
  }

  static async listSchedulingHolidays(
    token: string,
    params: { year: number; unitId?: number }
  ): Promise<ScheduleHoliday[]> {
    const url = new URL(this.url('/scheduling/holidays'));
    url.searchParams.set('year', String(params.year));
    if (params.unitId !== undefined) {
      url.searchParams.set('unitId', String(params.unitId));
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch scheduling holidays");
    return response.json();
  }

  static async createSchedulingHoliday(
    token: string,
    input: CreateScheduleHolidayInput
  ): Promise<ScheduleHoliday> {
    const response = await fetch(this.url('/scheduling/holidays'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error("Failed to create scheduling holiday");
    return response.json();
  }

  static async createScheduleCycle(token: string, input: CreateScheduleCycleInput): Promise<ScheduleCycle> {
    const response = await fetch(this.url('/scheduling/cycles'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error("Failed to create schedule cycle");
    return response.json();
  }

  static async getScheduleCycle(token: string, id: number | string): Promise<ScheduleCycle> {
    const response = await fetch(this.url(`/scheduling/cycles/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch schedule cycle");
    return response.json();
  }

  static async createShift(shift: Partial<Shift>, token: string): Promise<Shift> {
    const response = await fetch(this.url('/escala'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ScheduleMapper.shiftToDto(shift)),
    });
    if (!response.ok) throw new Error("Failed to create shift");
    const dto = await response.json();
    return ScheduleMapper.shiftToDomain(dto);
  }

  static async updateShift(id: string, shift: Partial<Shift>, token: string): Promise<Shift> {
    const response = await fetch(this.url(`/escala/${id}`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ScheduleMapper.shiftToDto(shift)),
    });
    if (!response.ok) throw new Error("Failed to update shift");
    const dto = await response.json();
    return ScheduleMapper.shiftToDomain(dto);
  }

  static async deleteShift(id: string, token: string): Promise<void> {
    const response = await fetch(this.url(`/escala/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete shift");
  }

  // Swaps
  static async listSwaps(token: string): Promise<ShiftSwap[]> {
    const response = await fetch(this.url('/schedules/swap-requests'), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch swaps");
    const dtos = await response.json();
    return dtos.map((dto: any) => ScheduleMapper.swapToDomain(dto));
  }

  static async createSwap(swap: Partial<ShiftSwap>, token: string): Promise<ShiftSwap> {
    const response = await fetch(this.url('/schedules/swap-requests'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ScheduleMapper.swapToDto(swap)),
    });
    if (!response.ok) throw new Error("Failed to create swap");
    const dto = await response.json();
    return ScheduleMapper.swapToDomain(dto);
  }

  static async decideSwap(id: string, decision: { approved: boolean; adminComments?: string }, token: string): Promise<ShiftSwap> {
    const response = await fetch(this.url(`/schedules/swap-requests/${id}/decision`), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decision),
    });
    if (!response.ok) throw new Error("Failed to decide swap");
    const dto = await response.json();
    return ScheduleMapper.swapToDomain(dto);
  }
}
