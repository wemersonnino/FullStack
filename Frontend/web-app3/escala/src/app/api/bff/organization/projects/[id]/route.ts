import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OrganizationService } from '@/core/application/services/organization.service';
import { Project } from '@/core/domain/models/organization.model';

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
    const updatedProject = await OrganizationService.updateProject(id, body as Partial<Project>, session.user.token);
    return NextResponse.json(updatedProject);
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
    await OrganizationService.deleteProject(id, session.user.token);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
