import { enforceRateLimit } from '@/lib/bff/rate-limit';
import { proxyBackend, readJson } from '@/lib/bff/backend';

export async function POST(request: Request) {
  const body = await readJson(request);
  const limited = await enforceRateLimit(request, {
    name: 'auth-google',
    limit: 12,
    windowMs: 10 * 60 * 1000,
    keyParts: [body?.companySlug],
  });
  if (limited) {
    return limited;
  }

  return proxyBackend('/api/v1/auth/google', {
    method: 'POST',
    body,
    authenticated: false,
    request,
  });
}
