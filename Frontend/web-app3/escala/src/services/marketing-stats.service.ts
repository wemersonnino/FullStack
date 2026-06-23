import { httpGet } from '@/lib/http/request';

export type MarketingStats = {
  totalLeads: number;
  activeTrials: number;
  convertedToPaid: number;
  aiRequestsThisMonth: number;
  conversionRate: number;
};

export async function getMarketingStats(authToken?: string): Promise<MarketingStats | null> {
  return httpGet<MarketingStats>('/api/bff/stats/marketing', undefined, authToken ? { authToken } : undefined);
}
