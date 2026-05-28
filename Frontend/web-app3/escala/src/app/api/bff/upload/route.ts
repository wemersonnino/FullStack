import { NextResponse } from 'next/server';
import { ENV } from '@/constants/env';

export async function POST(request: Request) {
  const formData = await request.formData();

  const response = await fetch(new URL('/api/upload', ENV.STRAPI_INTERNAL_URL), {
    method: 'POST',
    body: formData,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  return NextResponse.json(data, { status: response.status });
}
