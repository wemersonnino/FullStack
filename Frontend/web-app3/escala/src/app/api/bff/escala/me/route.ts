import { NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/bff/backend';
import { requireEscalaSession } from '../_permissions';

export async function GET(request: Request) {
  const state = await requireEscalaSession(request);
  if ('response' in state) return state.response;

  const response = await proxyBackend('/api/v1/escala/me', {
    searchParams: new URL(request.url).searchParams,
    request,
  });

  if (response.ok) {
    try {
      const data = await response.json();
      if (Array.isArray(data)) {
        const slimData = data.map((shift: any) => ({
          id: shift.id,
          shiftDate: shift.shiftDate || shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
          workMode: shift.workMode,
          status: shift.status,
          notes: shift.notes,
          employee: shift.employee ? {
            id: shift.employee.id,
            fullName: shift.employee.fullName,
          } : null,
        }));
        return NextResponse.json(slimData, { status: 200 });
      }
    } catch (e) {
      return response;
    }
  }

  return response;
}
