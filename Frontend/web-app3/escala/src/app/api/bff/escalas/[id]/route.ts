import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return proxyBackend(`/api/v1/escala/${params.id}`, {
    method: 'PUT',
    body: await readJson(request),
    request,
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return proxyBackend(`/api/v1/escala/${params.id}`, {
    method: 'DELETE',
    request,
  });
}
