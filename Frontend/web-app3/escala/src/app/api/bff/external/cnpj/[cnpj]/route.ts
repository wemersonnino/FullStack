import { NextResponse } from 'next/server';

const CNPJ_PATTERN = /^[0-9A-Za-z]{14}$/;
const CNPJ_REVALIDATE_SECONDS = 60 * 60 * 12;

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
      next: {
        revalidate: CNPJ_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ message: 'CNPJ nao encontrado' }, { status: 404 });
      }

      if (response.status === 429) {
        return NextResponse.json(
          { message: 'Limite de consultas de CNPJ atingido. Tente novamente em instantes.' },
          {
            status: 429,
            headers: {
              'Cache-Control': 'private, no-store',
            },
          }
        );
      }

      return NextResponse.json({ message: 'Falha ao consultar CNPJ' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': `public, max-age=${CNPJ_REVALIDATE_SECONDS}, s-maxage=${CNPJ_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Falha ao consultar CNPJ' }, { status: 502 });
  }
}
