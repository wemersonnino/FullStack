import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EmployeeService } from '@/core/application/services/employee.service';
import { Employee } from '@/core/domain/models/employee.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const employees = await EmployeeService.listEmployees(session.user.token);
    return NextResponse.json(employees);
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
    const newEmployee = await EmployeeService.createEmployee(body as Partial<Employee>, session.user.token);
    return NextResponse.json(newEmployee);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
