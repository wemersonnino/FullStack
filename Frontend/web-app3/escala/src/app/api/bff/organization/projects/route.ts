import { NextResponse } from 'next/server';
import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  const response = await proxyBackend('/api/v1/organization/projects', { request });

  if (response.ok) {
    try {
      const data = await response.json();
      if (Array.isArray(data)) {
        const slimData = data.map((proj: any) => ({
          id: proj.id,
          name: proj.name,
          description: proj.description,
          active: proj.active,
          sector: proj.sector ? {
            id: proj.sector.id,
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
  return proxyBackend('/api/v1/organization/projects', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
