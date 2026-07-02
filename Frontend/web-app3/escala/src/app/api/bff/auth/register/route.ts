import { enforceRateLimit } from '@/lib/bff/rate-limit';
import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function POST(request: Request) {
  const body = await readJson(request);
  const limited = await enforceRateLimit(request, {
    name: 'auth-register',
    limit: 8,
    windowMs: 15 * 60 * 1000,
    keyParts: [body?.email, body?.companySlug, body?.companyName],
  });
  if (limited) {
    return limited;
  }

  return proxyBackend('/api/v1/auth/register', {
    method: 'POST',
    body,
    authenticated: false,
    request,
  });
}
