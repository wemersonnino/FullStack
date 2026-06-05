import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CompanyService } from '@/core/application/services/company.service';
import { Company } from '@/core/domain/models/company.model';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const company = await CompanyService.getCompany(id, session.user.token);
    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updatedCompany = await CompanyService.updateCompany(id, body as Partial<Company>, session.user.token);
    return NextResponse.json(updatedCompany);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await CompanyService.deleteCompany(id, session.user.token);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
