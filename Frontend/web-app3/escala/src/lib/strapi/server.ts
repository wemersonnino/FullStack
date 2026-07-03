import 'server-only';

type RequestOptions = {
  throwOnError?: boolean;
};

function buildUrl(url: string, params?: Record<string, unknown>) {
  const target = new URL(url);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      target.searchParams.set(key, String(value));
    }
  }

  return target;
}

function readOnlyToken() {
  return process.env.STRAPI_API_TOKEN_READ_ONLY?.trim() || '';
}

function strapiHeaders() {
  const headers = new Headers({
    Accept: 'application/json',
  });

  const token = readOnlyToken();
  if (token) {
    headers.set('Authorization', `bearer ${token}`);
  }

  return headers;
}

export async function serverStrapiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T | null> {
  try {
    const target = buildUrl(url, params);
    const response = await fetch(target, {
      method: 'GET',
      headers: strapiHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Strapi respondeu ${response.status} para ${target.pathname}`);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Resposta inesperada do Strapi para ${target.pathname}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (options?.throwOnError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Falha desconhecida';
    console.warn(`[Strapi][GET] ${url}: ${message}`);
    return null;
  }
}
