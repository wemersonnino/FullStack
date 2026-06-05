import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ScheduleService } from '@/core/application/services/schedule.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await ScheduleService.decideSwap(id, body, session.user.token);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
