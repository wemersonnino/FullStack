import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/constants/env';
import { getMarketingAttribution } from '@/services/campaign';
import { LeadCapturePayload } from '@/types/campaign';

const ALLOWED_METHODS = ['POST'] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

function normalize(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mapAttribution(attribution: Awaited<ReturnType<typeof getMarketingAttribution>>) {
  if (!attribution) {
    return {};
  }

  return {
    utmSource: normalize(attribution.utm_source),
    utmMedium: normalize(attribution.utm_medium),
    utmCampaign: normalize(attribution.utm_campaign),
    utmContent: normalize(attribution.utm_content),
    utmTerm: normalize(attribution.utm_term),
    referrer: normalize(attribution.referrer),
    capturedAt: attribution.capturedAt,
  };
}

export async function POST(request: NextRequest) {
  if (!ALLOWED_METHODS.includes(request.method as (typeof ALLOWED_METHODS)[number])) {
    return jsonError('Metodo nao permitido', 405);
  }

  let payload: LeadCapturePayload & Record<string, unknown>;
  try {
    payload = (await request.json()) as LeadCapturePayload & Record<string, unknown>;
  } catch {
    return jsonError('Corpo da requisicao invalido', 400);
  }

  const attribution = await getMarketingAttribution();
  const backendPayload = {
    ...payload,
    source: normalize(payload.source) ?? 'LANDING_PAGE',
    companyName: normalize(payload.companyName),
    landingPageSlug: normalize(payload.landingPageSlug),
    campaignSlug: normalize(payload.campaignSlug),
    ...mapAttribution(attribution),
    referrer: normalize(attribution?.referrer) ?? normalize(request.headers.get('referer')),
    capturedAt: attribution?.capturedAt ?? new Date().toISOString(),
  };

  try {
    const response = await fetch(`${ENV.API_BASE_URL}/api/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'escala-next-bff',
      },
      body: JSON.stringify(backendPayload),
      cache: 'no-store',
    });

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[BFF] Falha ao enviar lead', {
      error: error instanceof Error ? error.message : 'unknown',
    });

    return jsonError('Nao foi possivel registrar o lead', 502);
  }
}
