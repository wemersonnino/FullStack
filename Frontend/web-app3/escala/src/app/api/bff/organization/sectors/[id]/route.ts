import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OrganizationService } from '@/core/application/services/organization.service';
import { Sector } from '@/core/domain/models/organization.model';

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
    const updatedSector = await OrganizationService.updateSector(id, body as Partial<Sector>, session.user.token);
    return NextResponse.json(updatedSector);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await OrganizationService.deleteSector(id, session.user.token);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
