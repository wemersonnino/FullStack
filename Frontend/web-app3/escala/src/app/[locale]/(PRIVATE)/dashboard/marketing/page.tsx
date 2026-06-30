import { redirect } from 'next/navigation';
import { MarketingStatsPanel } from '@/components/dashboard/MarketingStatsPanel';
import { getMarketingStats, MarketingStats } from '@/services/marketing-stats.service';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

const MARKETING_ROLES = new Set(['ADMIN', 'OWNER', 'MARKETING']);

const EMPTY_STATS: MarketingStats = {
  totalLeads: 0,
  activeTrials: 0,
  convertedToPaid: 0,
  aiRequestsThisMonth: 0,
  conversionRate: 0,
};

export default async function MarketingDashboardPage() {
  const { session, accessToken } = await getRequiredServerAuth();

  const roles = session.user.roles ?? [];
  const canAccess = roles.some((role) => MARKETING_ROLES.has(role));

  if (!canAccess) {
    redirect('/dashboard');
  }

  const stats = await getMarketingStats(accessToken);

  return <MarketingStatsPanel stats={stats ?? EMPTY_STATS} />;
}
