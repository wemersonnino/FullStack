import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ReportService } from '@/core/application/services/report.service';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || '2026-05';

  try {
    const data = await ReportService.getPayrollData(session.user.token, month);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
