import { NextResponse } from 'next/server';
import { ENV } from '@/constants/env';
import { getOptionalServerAccessToken } from '@/lib/auth/server-auth';

export async function POST(request: Request) {
  const accessToken = await getOptionalServerAccessToken();
  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${ENV.API_BASE_URL}/api/v1/auth/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Erro ao finalizar registro no backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
