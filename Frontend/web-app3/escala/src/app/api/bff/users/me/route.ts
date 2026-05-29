import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserService } from '@/core/application/services/user.service';
import { UserProfile } from '@/core/domain/models/user.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await UserService.getCurrentProfile(session.user.token);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // O body vindo da UI já segue a interface UserProfile ou parcial dela
    const updatedProfile = await UserService.updateProfile(session.user.token, body as Partial<UserProfile>);
    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
