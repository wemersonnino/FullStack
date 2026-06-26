import { NextResponse } from 'next/server';
import { proxyBackend, readJson } from '@/lib/bff/backend';
import { requireCanViewAllEscalas, requireEscalaAdmin } from './_permissions';

export async function GET(request: Request) {
  const state = await requireCanViewAllEscalas();
  if ('response' in state) return state.response;

  const response = await proxyBackend('/api/v1/escala', {
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

export async function POST(request: Request) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;

  return proxyBackend('/api/v1/escala', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
