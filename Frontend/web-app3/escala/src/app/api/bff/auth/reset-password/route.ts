import { enforceRateLimit } from '@/lib/bff/rate-limit';
import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function POST(request: Request) {
  const body = await readJson(request);
  const limited = await enforceRateLimit(request, {
    name: 'auth-reset-password',
    limit: 6,
    windowMs: 10 * 60 * 1000,
    keyParts: [body?.code],
  });
  if (limited) {
    return limited;
  }

  return proxyBackend('/api/v1/auth/reset-password', {
    method: 'POST',
    body,
    authenticated: false,
    request,
  });
}
