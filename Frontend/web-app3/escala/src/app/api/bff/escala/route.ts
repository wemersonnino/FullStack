import { NextResponse } from 'next/server';
import { requireCanViewAllEscalas, requireEscalaAdmin } from './_permissions';
import { ScheduleService } from '@/core/application/services/schedule.service';
import { Shift } from '@/core/domain/models/schedule.model';

export async function GET(request: Request) {
  const state = await requireCanViewAllEscalas();
  if ('response' in state) return state.response;

  try {
    const { searchParams } = new URL(request.url);
    const shifts = await ScheduleService.listShifts(state.session.user.token, searchParams);
    return NextResponse.json(shifts);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;

  try {
    const body = await request.json();
    const newShift = await ScheduleService.createShift(body as Partial<Shift>, state.session.user.token);
    return NextResponse.json(newShift);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
