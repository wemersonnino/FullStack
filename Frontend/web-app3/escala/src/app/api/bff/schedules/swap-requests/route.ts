import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ScheduleService } from '@/core/application/services/schedule.service';
import { ShiftSwap } from '@/core/domain/models/schedule.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const swaps = await ScheduleService.listSwaps(session.user.token);
    return NextResponse.json(swaps);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newSwap = await ScheduleService.createSwap(body as Partial<ShiftSwap>, session.user.token);
    return NextResponse.json(newSwap);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
