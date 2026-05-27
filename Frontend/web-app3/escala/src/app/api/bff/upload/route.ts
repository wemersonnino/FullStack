import { proxyBackend } from '@/lib/bff/backend';

export async function POST(request: Request) {
  const formData = await request.formData();
  
  return proxyBackend('/api/upload', {
    method: 'POST',
    body: formData,
    request,
  });
}
