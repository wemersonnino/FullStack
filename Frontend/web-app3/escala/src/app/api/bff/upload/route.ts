import { NextResponse } from 'next/server';
import { ENV } from '@/constants/env';
import { getOptionalServerSession } from '@/lib/auth/server-auth';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ADMIN_ROLES = new Set(['OWNER', 'ADMIN', 'SYSTEM_ADMIN']);

export async function POST(request: Request) {
  const session = await getOptionalServerSession();
  const roles = session?.user?.roles ?? [];
  const hasWriteAccess = roles.some((role) => ADMIN_ROLES.has(role));

  if (!session?.user || !hasWriteAccess) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const uploadToken = process.env.STRAPI_API_TOKEN_UPLOAD?.trim();
  if (!uploadToken) {
    return NextResponse.json(
      { message: 'Strapi upload token nao configurado.' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const files = formData.getAll('files');

  if (files.length === 0) {
    return NextResponse.json({ message: 'Arquivo nao informado.' }, { status: 400 });
  }

  for (const file of files) {
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Payload de upload invalido.' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ message: 'Formato de arquivo nao suportado.' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ message: 'A imagem deve ter no maximo 5MB.' }, { status: 400 });
    }
  }

  const response = await fetch(new URL('/api/upload', ENV.STRAPI_INTERNAL_URL), {
    method: 'POST',
    headers: {
      Authorization: `bearer ${uploadToken}`,
    },
    body: formData,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  return NextResponse.json(data, { status: response.status });
}
