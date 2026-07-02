import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getOptionalServerSession } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function extensionFor(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) return extension;

  if (file.type === 'image/jpeg') return '.jpg';
  if (file.type === 'image/png') return '.png';
  if (file.type === 'image/gif') return '.gif';
  if (file.type === 'image/webp') return '.webp';

  return '';
}

export async function POST(request: Request) {
  const session = await getOptionalServerSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Arquivo de avatar nao informado.' }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ message: 'Formato de imagem nao suportado.' }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json({ message: 'A imagem deve ter no maximo 2MB.' }, { status: 400 });
  }

  const extension = extensionFor(file);
  if (!extension) {
    return NextResponse.json({ message: 'Extensao de imagem invalida.' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${session.user.id}-${randomUUID()}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), bytes);

  return NextResponse.json({ url: `/uploads/avatars/${fileName}` });
}
