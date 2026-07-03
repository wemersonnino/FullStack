import { httpGet, type RequestOptions } from '@/lib/http/request';

export async function strapiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T | null> {
  if (typeof window !== 'undefined') {
    return httpGet<T>(url, params, options);
  }

  const { serverStrapiGet } = await import('./server');
  return serverStrapiGet<T>(url, params, options);
}
