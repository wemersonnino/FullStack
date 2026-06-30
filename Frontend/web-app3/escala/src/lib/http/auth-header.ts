export function withOptionalBearer(token?: string, headers: HeadersInit = {}): HeadersInit {
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}
