import { NextResponse } from 'next/server';
import { getOptionalServerSession } from '@/lib/auth/server-auth';
import { readPrivateAvatarFile } from '@/lib/avatar/storage';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    fileName: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await getOptionalServerSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { fileName } = await context.params;
  const avatar = await readPrivateAvatarFile(fileName).catch(() => null);

  if (!avatar) {
    return NextResponse.json({ message: 'Avatar not found' }, { status: 404 });
  }

  return new NextResponse(avatar.bytes, {
    status: 200,
    headers: {
      'Content-Type': avatar.contentType,
      'Cache-Control': 'private, max-age=300',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
