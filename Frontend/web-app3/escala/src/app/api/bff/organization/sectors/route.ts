import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OrganizationService } from '@/core/application/services/organization.service';
import { Sector } from '@/core/domain/models/organization.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sectors = await OrganizationService.listSectors(session.user.token);
    return NextResponse.json(sectors);
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
    const newSector = await OrganizationService.createSector(body as Partial<Sector>, session.user.token);
    return NextResponse.json(newSector);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
