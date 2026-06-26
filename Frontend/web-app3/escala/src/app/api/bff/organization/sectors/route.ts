import { NextResponse } from 'next/server';
import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  const response = await proxyBackend('/api/v1/organization/sectors', { request });

  if (response.ok) {
    try {
      const data = await response.json();
      if (Array.isArray(data)) {
        const slimData = data.map((sec: any) => ({
          id: sec.id,
          name: sec.name,
          description: sec.description,
          active: sec.active,
          maxSeats: sec.maxSeats,
          manager: sec.manager ? {
            id: sec.manager.id,
            username: sec.manager.username,
          } : null,
        }));
        return NextResponse.json(slimData, { status: 200 });
      }
    } catch (e) {
      return response;
    }
  }

  return response;
}

export async function POST(request: Request) {
  return proxyBackend('/api/v1/organization/sectors', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
