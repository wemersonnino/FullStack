import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function POST(request: Request) {
  return proxyBackend('/api/v1/schedules/generate', {
    method: 'POST',
    body: await readJson(request),
    request,
  });
}
