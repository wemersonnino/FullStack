import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { InvitationService } from '@/core/application/services/invitation.service';
import { TeamInvitationCreate } from '@/core/domain/models/invitation.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invitations = await InvitationService.listInvitations(session.user.token);
    return NextResponse.json(invitations);
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
    const invitation = await InvitationService.sendInvitation(body as TeamInvitationCreate, session.user.token);
    return NextResponse.json(invitation);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
