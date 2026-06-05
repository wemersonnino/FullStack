import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { OrganizationService } from '@/core/application/services/organization.service';
import { Project } from '@/core/domain/models/organization.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await OrganizationService.listProjects(session.user.token);
    return NextResponse.json(projects);
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
    const newProject = await OrganizationService.createProject(body as Partial<Project>, session.user.token);
    return NextResponse.json(newProject);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
