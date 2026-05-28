import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return proxyBackend(`/api/v1/organization/sectors/${params.id}`, {
    method: 'PUT',
    body: await readJson(request),
    request,
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return proxyBackend(`/api/v1/organization/sectors/${params.id}`, {
    method: 'DELETE',
    request,
  });
}
