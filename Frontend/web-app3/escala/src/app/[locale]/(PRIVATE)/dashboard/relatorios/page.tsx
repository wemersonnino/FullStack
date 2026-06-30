import { format } from 'date-fns';
import { ReportService } from '@/core/application/services/report.service';
import { RelatoriosView } from '@/features/reports/components/RelatoriosView';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

type RelatoriosPageProps = {
  searchParams?: Promise<{ month?: string }>;
};

export default async function RelatoriosPage({ searchParams }: RelatoriosPageProps) {
  const { accessToken } = await getRequiredServerAuth();

  const params = await searchParams;
  const month = params?.month || format(new Date(), 'yyyy-MM');
  const items = await ReportService.getPayrollData(accessToken, month);

  return <RelatoriosView month={month} items={items} />;
}
