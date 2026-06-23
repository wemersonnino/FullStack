import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MarketingStatsPanel } from '@/components/dashboard/MarketingStatsPanel';
import { getMarketingStats, MarketingStats } from '@/services/marketing-stats.service';

const MARKETING_ROLES = new Set(['ADMIN', 'OWNER', 'MARKETING']);

const EMPTY_STATS: MarketingStats = {
  totalLeads: 0,
  activeTrials: 0,
  convertedToPaid: 0,
  aiRequestsThisMonth: 0,
  conversionRate: 0,
};

export default async function MarketingDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const roles = session.user.roles ?? [];
  const canAccess = roles.some((role) => MARKETING_ROLES.has(role));

  if (!canAccess) {
    redirect('/dashboard');
  }

  const stats = await getMarketingStats(session.user.token);

  return <MarketingStatsPanel stats={stats ?? EMPTY_STATS} />;
}
