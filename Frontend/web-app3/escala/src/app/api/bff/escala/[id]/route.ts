import { NextResponse } from 'next/server';
import { requireEscalaAdmin } from '../_permissions';
import { ScheduleService } from '@/core/application/services/schedule.service';
import { Shift } from '@/core/domain/models/schedule.model';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const updatedShift = await ScheduleService.updateShift(id, body as Partial<Shift>, state.session.user.token);
    return NextResponse.json(updatedShift);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const state = await requireEscalaAdmin();
  if ('response' in state) return state.response;

  try {
    const { id } = await context.params;
    await ScheduleService.deleteShift(id, state.session.user.token);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
