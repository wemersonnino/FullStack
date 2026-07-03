import { NextResponse } from 'next/server';
import { getOptionalServerSession } from '@/lib/auth/server-auth';
import {
  buildPrivateAvatarUrl,
  detectAvatarFormat,
  isAllowedDeclaredAvatarType,
  replaceUserAvatarFile,
  sanitizeAvatarImage,
} from '@/lib/avatar/storage';

export const runtime = 'nodejs';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getOptionalServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Arquivo de avatar nao informado.' }, { status: 400 });
  }

  if (!isAllowedDeclaredAvatarType(file.type)) {
    return NextResponse.json({ message: 'Formato de imagem nao suportado.' }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json({ message: 'A imagem deve ter no maximo 2MB.' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detectedFormat = detectAvatarFormat(bytes);
  if (!detectedFormat) {
    return NextResponse.json({ message: 'Conteudo de imagem invalido.' }, { status: 400 });
  }

  if (detectedFormat.contentType !== file.type) {
    return NextResponse.json({ message: 'Tipo real do arquivo nao corresponde ao MIME declarado.' }, { status: 400 });
  }

  let sanitizedAvatar;
  try {
    sanitizedAvatar = await sanitizeAvatarImage(bytes);
  } catch {
    return NextResponse.json({ message: 'Nao foi possivel processar a imagem do avatar.' }, { status: 400 });
  }

  const fileName = await replaceUserAvatarFile(
    session.user.id,
    sanitizedAvatar.bytes,
    sanitizedAvatar.format,
  );

  return NextResponse.json({ url: buildPrivateAvatarUrl(fileName) });
}
