import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CompanyService } from '@/core/application/services/company.service';
import { Company } from '@/core/domain/models/company.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const companies = await CompanyService.listCompanies(session.user.token);
    return NextResponse.json(companies);
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
    const newCompany = await CompanyService.createCompany(body as Partial<Company>, session.user.token);
    return NextResponse.json(newCompany);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
