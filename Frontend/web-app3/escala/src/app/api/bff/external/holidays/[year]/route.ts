import { NextResponse } from 'next/server';

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;
  const parsedYear = Number(year);

  if (!Number.isInteger(parsedYear) || parsedYear < MIN_YEAR || parsedYear > MAX_YEAR) {
    return NextResponse.json({ message: 'Ano invalido' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${parsedYear}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'Falha ao consultar feriados' }, { status: response.status });
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
    return NextResponse.json({ message: 'Falha ao consultar feriados' }, { status: 502 });
  }
}
