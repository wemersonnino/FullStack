import { NextResponse } from 'next/server';

const CNPJ_PATTERN = /^[0-9A-Za-z]{14}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj } = await params;
  const normalizedCnpj = cnpj.replace(/[^0-9A-Za-z]/g, '');

  if (!CNPJ_PATTERN.test(normalizedCnpj)) {
    return NextResponse.json({ message: 'CNPJ invalido' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${normalizedCnpj}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'CNPJ nao encontrado' }, { status: response.status });
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
    return NextResponse.json({ message: 'Falha ao consultar CNPJ' }, { status: 502 });
  }
}
