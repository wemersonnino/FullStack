import { NextResponse } from 'next/server';
import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function GET(request: Request) {
  const response = await proxyBackend('/api/v1/employees', { request });

  if (response.ok) {
    try {
      const data = await response.json();
      if (Array.isArray(data)) {
        const slimData = data.map((emp: any) => ({
          id: emp.id,
          fullName: emp.fullName,
          email: emp.email,
          active: emp.active,
          sector: emp.sector ? {
            id: emp.sector.id,
            name: emp.sector.name,
          } : null,
          project: emp.project ? {
            id: emp.project.id,
            name: emp.project.name,
          } : null,
          user: emp.user ? {
            id: emp.user.id,
            username: emp.user.username,
            email: emp.user.email,
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
  return proxyBackend('/api/v1/employees', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
