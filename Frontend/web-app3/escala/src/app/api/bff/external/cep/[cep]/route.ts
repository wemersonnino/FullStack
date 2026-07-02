import { NextResponse } from 'next/server';

const CEP_PATTERN = /^\d{8}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cep: string }> }
) {
  const { cep } = await params;
  const normalizedCep = cep.replace(/\D/g, '');

  if (!CEP_PATTERN.test(normalizedCep)) {
    return NextResponse.json({ message: 'CEP invalido' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${normalizedCep}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'CEP nao encontrado' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Falha ao consultar CEP' }, { status: 502 });
  }
}
