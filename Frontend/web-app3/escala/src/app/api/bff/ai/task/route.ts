import { proxyBackend } from '@/lib/bff/backend';

export async function POST(request: Request) {
  const body = await request.json();
  const { task } = body;

  let endpoint = '/api/v1/ai/analyze-risk';
  if (task === 'SUGGEST_REPLACEMENT') {
    endpoint = '/api/v1/ai/suggest-replacement';
  } else if (task === 'EXPLAIN_CONFLICT') {
    endpoint = '/api/v1/ai/explain-conflict';
  }

  const res = await proxyBackend(endpoint, {
    method: 'POST',
    body: body.context || {},
    request,
  });

  if (!res.ok) return res;

  const data = await res.json();
  const normalizedResponse = data.analysis || data.suggestion || data.explanation || 'Sem resposta disponível';

  return new Response(JSON.stringify({ response: normalizedResponse }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
